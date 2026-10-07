import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileUp,
  Grid,
  Layers,
  List,
  Loader2,
  Menu,
  Search,
  Trash2,
  X,
} from "lucide-react";

export default function Dashboard({
  activeCategory,
  onOpenMobileMenu,
}) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const PAGE_SIZE = 6;
  const CHUNK_SIZE = 10 * 1024 * 1024;
  const BATCH_SIZE = 2;

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = FRONTEND_URL;
      return;
    }

    async function getFiles() {
      setIsLoading(true);

      try {
        const response = await fetch(`${BACKEND_URL}/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          triggerNotification("Session expired", "warning");
          window.location.href = FRONTEND_URL;
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
        window.location.href = FRONTEND_URL;
      } finally {
        setIsLoading(false);
      }
    }

    getFiles();
  }, [refreshKey]);

  const triggerNotification = (message, type = "success") => {
    setShowNotification({ message, type });

    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat(
      (bytes / Math.pow(k, i)).toFixed(Math.max(0, decimals))
    )} ${sizes[i]}`;
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (event.dataTransfer.files?.[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }

    event.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSelectedFileUpload = () => {
    if (!selectedFile || uploading) return;

    const file = selectedFile;
    setSelectedFile(null);
    handleFileProcess(file);
  };

  const handleFileProcess = async (file) => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = FRONTEND_URL;
      return;
    }

    setUploading(true);
    setProgress(0);

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;

    try {
      for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE, totalChunks);

        const uploadPromises = [];

        for (let j = i; j < batchEnd; j++) {
          const start = j * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          uploadPromises.push(
            fetch(
              `${BACKEND_URL}/upload?filename=${encodeURIComponent(
                file.name
              )}&index=${j}`,
              {
                method: "POST",
                body: chunk,
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/octet-stream",
                },
              }
            )
              .then(async (response) => {
                if (!response.ok) {
                  throw new Error(`Chunk ${j} upload failed`);
                }

                return response.json();
              })
              .then((data) => {
                uploadedChunks += 1;
                setProgress(
                  Math.round((uploadedChunks / totalChunks) * 100)
                );
                return data;
              })
          );
        }

        const results = await Promise.all(uploadPromises);
        const repo = results[0].repo;

        await fetch(`${BACKEND_URL}/commit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            blobShas: results.map((result) => ({
              index: result.index,
              sha: result.blobSha,
            })),
            fileSize: file.size,
            isFirstBatch: i === 0,
            isLastBatch: batchEnd === totalChunks,
            repo,
          }),
        });
      }

      setProgress(100);
      triggerNotification(`${file.name} uploaded successfully`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.error("Upload failed:", error);
      triggerNotification("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName) => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = FRONTEND_URL;
      return;
    }

    setDeleting(fileName);

    try {
      const response = await fetch(
        `${BACKEND_URL}/delete?filename=${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.file_name !== fileName)
      );

      triggerNotification(`"${fileName}" deleted`, "warning");
    } catch (error) {
      console.error("Delete error:", error);
      triggerNotification("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const executeDelete = () => {
    if (!fileToDelete) return;

    handleDelete(fileToDelete.file_name);
    setFileToDelete(null);
  };

  const handleDownload = async (fileName) => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = FRONTEND_URL;
      return;
    }

    try {
      if (window.showSaveFilePicker) {
        await downloadWithFilePicker(fileName, token);
      } else {
        await downloadWithBlob(fileName, token);
      }
    } catch (error) {
      if (error?.name === "AbortError") return;

      console.error("Download failed:", error);
      setProgress(0);
      setUploading(false);
      triggerNotification("Download failed", "error");
    }
  };

  const downloadWithFilePicker = async (fileName, token) => {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
    });

    const writableStream = await fileHandle.createWritable();

    setUploading(true);
    setProgress(0);

    try {
      const response = await fetch(
        `${BACKEND_URL}/download?filename=${encodeURIComponent(fileName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download request failed");
      }

      const totalSize = parseInt(
        response.headers.get("X-File-Size") || "0",
        10
      );

      const reader = response.body.getReader();
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        await writableStream.write(value);
        receivedSize += value.length;

        if (totalSize > 0) {
          setProgress(Math.round((receivedSize / totalSize) * 100));
        }
      }

      await writableStream.close();

      setProgress(100);
      triggerNotification(`${fileName} downloaded successfully`);
    } catch (error) {
      await writableStream.abort().catch(() => {});
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const downloadWithBlob = async (fileName, token) => {
    setUploading(true);
    setProgress(0);

    const response = await fetch(
      `${BACKEND_URL}/download?filename=${encodeURIComponent(fileName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Download request failed");
    }

    const totalSize = parseInt(
      response.headers.get("Content-Length") || "0",
      10
    );

    const reader = response.body.getReader();
    const chunks = [];
    let receivedSize = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedSize += value.length;

      if (totalSize > 0) {
        setProgress(Math.round((receivedSize / totalSize) * 100));
      }
    }

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);

    setProgress(100);
    setUploading(false);
    triggerNotification(`${fileName} downloaded successfully`);
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.file_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeCategory === "all") return matchesSearch;
    if (activeCategory === "favorites") {
      return file.isFavorite && matchesSearch;
    }

    return file.category === activeCategory && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginatedFiles = filteredFiles.slice(
    pageStart,
    pageStart + PAGE_SIZE
  );

  const pageNumbers = [];

  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - safePage) <= 1
    ) {
      pageNumbers.push(page);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  const categoryLabel =
    activeCategory === "all"
      ? "All files"
      : activeCategory === "favorites"
        ? "Favorites"
        : activeCategory;

  return (
    <div className="flex-1 min-w-0 min-h-screen overflow-y-auto bg-[#F4F5F7] text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <header className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div className="flex items-start gap-3">
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div>
                <div className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span>Workspace</span>
                  <span>/</span>
                  <span className="text-slate-700">{categoryLabel}</span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Your files
                </h1>

                <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  GitHub-powered storage
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="search-files"
                type="text"
                placeholder="SEARCH FILES..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full border-2 border-slate-900 bg-white pl-10 pr-10 text-[10px] font-black uppercase tracking-widest outline-none placeholder:text-slate-400 focus:border-[#0052FF]"
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 border-b-2 border-slate-900" />
        </header>

        {/* Upload */}
        <section
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative mb-7 overflow-hidden border-2 bg-white transition-colors ${
            dragActive
              ? "border-[#0052FF] bg-blue-50"
              : "border-slate-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-dropzone-input"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center px-6 py-9 text-center sm:py-11">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white">
                <FileUp className="h-5 w-5" />
              </div>

              <h2 className="text-sm font-black uppercase tracking-widest">
                Upload a file
              </h2>

              <p className="mt-2 max-w-md text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Drop a file here or{" "}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="font-black text-[#0052FF] underline underline-offset-2 hover:text-blue-700 cursor-pointer"
                >
                  browse your device
                </button>
              </p>

              <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Files are automatically split into chunks for GitHub storage
              </p>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    File selected
                  </p>
                  <h2 className="mt-1 text-sm font-black uppercase tracking-wide">
                    Ready to upload
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 text-slate-500 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  aria-label="Remove selected file"
                  title="Remove selected file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 border-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white">
                  <File className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-black uppercase tracking-wide"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>{selectedFile.type || "Unknown type"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectedFileUpload}
                  disabled={uploading}
                  className="flex shrink-0 items-center justify-center gap-2 bg-slate-900 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#0052FF] disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Upload file
                </button>
              </div>

              <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
                GitStore will split this file into chunks before storing it in GitHub
              </p>
            </div>
          )}

          {dragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0052FF]/10 backdrop-blur-[1px]">
              <div className="border-2 border-slate-900 bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[6px_6px_0px_#0052FF]">
                Release to select
              </div>
            </div>
          )}
        </section>

        {/* Transfer progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-7 border-2 border-slate-900 bg-slate-950 p-4 text-white"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Transfer in progress
                  </span>
                </div>

                <span className="font-mono text-xs font-bold">
                  {progress}%
                </span>
              </div>

              <div className="h-2 border border-white/30 bg-white/10 p-px">
                <motion.div
                  className="h-full bg-white"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 border-b-2 border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              {isLoading
                ? "Loading files..."
                : filteredFiles.length === 0
                  ? "0 files"
                  : `${pageStart + 1}-${pageStart + paginatedFiles.length} of ${filteredFiles.length} files`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[8px] font-bold uppercase tracking-widest text-slate-400 sm:block">
              View
            </span>

            <div className="flex border-2 border-slate-900 bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-9 items-center justify-center cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-900"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-9 items-center justify-center border-l-2 border-slate-900 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-900"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="border-2 border-slate-900 bg-white px-6 py-20 text-center">
            <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Loading files
            </p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="border-2 border-slate-900 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-slate-900 bg-slate-50">
              <Layers className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest">
              {searchQuery ? "No files found" : "No files yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-[9px] font-bold uppercase tracking-widest leading-relaxed text-slate-400">
              {searchQuery
                ? `Nothing matches "${searchQuery}".`
                : "Upload your first file to start using GitStore."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedFiles.map((file) => (
              <motion.article
                layout
                key={file.file_name}
                className="group flex min-h-[205px] flex-col justify-between border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000]"
              >
                <div>
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white">
                      <File className="h-4 w-4" />
                    </div>

                    <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-slate-400">
                      {file.category || "file"}
                    </span>
                  </div>

                  <h3
                    className="truncate text-xs font-black uppercase tracking-wide"
                    title={file.file_name}
                  >
                    {file.file_name}
                  </h3>

                  <div className="mt-3 space-y-1 text-[9px] font-mono font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(file.uploaded_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <span className="block">
                      {formatBytes(file.file_size)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 border-t-2 border-slate-100 pt-3">
                  <button
                    onClick={() => handleDownload(file.file_name)}
                    className="flex flex-1 items-center justify-center gap-2 bg-slate-900 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#0052FF] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>

                  <button
                    onClick={() => setFileToDelete(file)}
                    className="flex w-10 items-center justify-center border-2 border-slate-200 text-rose-500 hover:border-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete file"
                    aria-label={`Delete ${file.file_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden border-2 border-slate-900 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_160px_190px] bg-slate-950 text-white md:grid">
              <div className="p-3 text-[9px] font-black uppercase tracking-widest">
                File
              </div>
              <div className="border-l border-white/20 p-3 text-[9px] font-black uppercase tracking-widest">
                Size
              </div>
              <div className="border-l border-white/20 p-3 text-[9px] font-black uppercase tracking-widest">
                Uploaded
              </div>
              <div className="border-l border-white/20 p-3 text-right text-[9px] font-black uppercase tracking-widest">
                Actions
              </div>
            </div>

            <div className="divide-y-2 divide-slate-100">
              {paginatedFiles.map((file) => (
                <div
                  key={file.file_name}
                  className="flex flex-col gap-3 p-4 hover:bg-slate-50 transition-colors md:grid md:grid-cols-[minmax(0,1fr)_120px_160px_190px] md:items-center md:gap-0 md:p-0"
                >
                  <div className="flex min-w-0 items-center gap-3 md:p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-900 bg-slate-950 text-white">
                      <File className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="truncate text-[10px] font-black uppercase tracking-wide"
                        title={file.file_name}
                      >
                        {file.file_name}
                      </p>

                      <p className="mt-1 text-[8px] font-bold uppercase text-slate-400 md:hidden">
                        {formatBytes(file.file_size)}
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-[10px] font-mono font-bold text-slate-500 md:block md:border-l md:border-slate-100 md:p-3">
                    {formatBytes(file.file_size)}
                  </div>

                  <div className="hidden text-[10px] font-bold uppercase text-slate-500 md:block md:border-l md:border-slate-100 md:p-3">
                    {new Date(file.uploaded_at).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </div>

                  <div className="flex gap-2 md:justify-end md:border-l md:border-slate-100 md:p-3">
                    <button
                      onClick={() => handleDownload(file.file_name)}
                      className="flex flex-1 items-center justify-center gap-2 bg-slate-900 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#0052FF] transition-colors cursor-pointer md:flex-none"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>

                    <button
                      onClick={() => setFileToDelete(file)}
                      className="flex h-9 w-9 items-center justify-center border-2 border-slate-200 text-rose-500 hover:border-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete file"
                      aria-label={`Delete ${file.file_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredFiles.length > PAGE_SIZE && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Page {safePage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-white hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`gap-${index}`}
                    className="px-2 text-xs font-black text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === safePage ? "page" : undefined}
                    className={`min-w-9 h-9 border-2 border-slate-900 px-2 text-[10px] font-black transition-colors cursor-pointer ${
                      page === safePage
                        ? "bg-slate-900 text-white"
                        : "bg-white hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-white hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50">
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`pointer-events-auto flex max-w-sm items-center gap-3 border-2 p-4 text-[9px] font-black uppercase tracking-widest shadow-[6px_6px_0px_#000] ${
                showNotification.type === "success"
                  ? "border-slate-900 bg-slate-950 text-white"
                  : showNotification.type === "warning"
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-rose-500 bg-rose-50 text-rose-900"
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{showNotification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToDelete(null)}
              className="absolute inset-0 bg-slate-950 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 w-full max-w-md border-4 border-slate-900 bg-white shadow-[12px_12px_0px_#000]"
            >
              <div className="p-7 sm:p-9">
                <div className="mb-5 h-1 w-10 bg-rose-500" />

                <h2 className="text-xl font-black uppercase tracking-tight">
                  Delete file?
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  This will permanently remove{" "}
                  <span className="break-all font-mono font-bold text-slate-900">
                    {fileToDelete.file_name}
                  </span>
                  .
                </p>
              </div>

              <div className="grid grid-cols-2 border-t-4 border-slate-900">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="py-5 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={executeDelete}
                  disabled={deleting === fileToDelete.file_name}
                  className="border-l-2 border-slate-900 bg-rose-500 py-5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-rose-600 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {deleting === fileToDelete.file_name
                    ? "Deleting..."
                    : "Delete file"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
