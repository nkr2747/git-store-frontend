import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  UploadCloud,
  Grid,
  List,
  Download,
  Trash2,
  Star,
  File,
  FileText,
  Image,
  Film,
  MoreHorizontal,
  AlertTriangle,
  Plus,
  CheckCircle,
  Menu,
  Heart,
  Calendar,
  Layers,
  FileUp,
  X,
} from "lucide-react";

export default function Dashboard({
  activeCategory,
  onAddFile,
  onToggleFavorite,
  onOpenMobileMenu,
}) {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showNotification, setShowNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [changeFiles, setChangeFile] = useState(0);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
   const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
  // Deletion confirmation dialog state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = FRONTEND_URL;
      return;
    }

    async function getFiles() {
      try {
        const response = await fetch(`${BACKEND_URL}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          triggerNotification("Sesssion expired!", 'warning')
          window.location.href = FRONTEND_URL; // hard redirect, always works even if app state is broken
          return;
        }
        const data = await response.json();
        setFiles(data); // ✅
        //console.log("Fetched data:", data);
        //console.log("Fetched files:", files);
      } catch (error) {
        console.error("Error fetching files:", error);
        window.location.href = FRONTEND_URL;
      }
    }

    getFiles();
  }, [changeFiles]);
  const [fileToDelete, setFileToDelete] = useState(null);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };
  const getFileIcon = (category, type) => {
    const iconClass = "w-5 h-5";
    switch (category) {
      case "documents":
        return <FileText className={`${iconClass} text-indigo-600`} />;
      case "images":
        return <Image className={`${iconClass} text-emerald-600`} />;
      case "media":
        return <Film className={`${iconClass} text-rose-600`} />;
      default:
        return <File className={`${iconClass} text-amber-600`} />;
    }
  };
  // Color picker helper
  const getCategoryBgColor = (category) => {
    switch (category) {
      case "documents":
        return "bg-indigo-50 border-indigo-100";
      case "images":
        return "bg-emerald-50 border-emerald-100";
      case "media":
        return "bg-rose-50 border-rose-100";
      default:
        return "bg-amber-50 border-amber-100";
    }
  };
  // Confirm delete handler
  const initiateDelete = (file) => {
    setFileToDelete(file);
  };
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  const handleFileProcess = async (file) => {
    setUploading(true);
    setProgress(0);
    setUploadProgress(0);
    const token = localStorage.getItem("token");
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
    const BATCH_SIZE = 2;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0; // ✅ kitne chunks upload hue

    try {
      for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE, totalChunks);

        // Step 1 - parallel blob upload
        const uploadPromises = [];
        for (let j = i; j < batchEnd; j++) {
          const start = j * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          uploadPromises.push(
            fetch(`${BACKEND_URL}/upload?filename=${file.name}&index=${j}`, {
              method: "POST",
              body: chunk,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/octet-stream",
              },
            })
              .then((r) => r.json())
              .then((data) => {
                // ✅ har chunk complete hone pe progress update karo
                uploadedChunks++;
                setProgress(Math.round((uploadedChunks / totalChunks) * 100));
                setUploadProgress(progress);
                return data;
              }),
          );
        }

        const results = await Promise.all(uploadPromises);
        // Step 2 - commit
        const repo = results[0].repo;
        console.log(repo);
        const isLastBatch = batchEnd === totalChunks;
        const isFirstBatch = i === 0;
        await fetch(`${BACKEND_URL}/commit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            blobShas: results.map((r) => ({ index: r.index, sha: r.blobSha })),
            fileSize: file.size,
            isFirstBatch,
            isLastBatch,
            repo,
          }),
        });

        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} committed!`);
      }

      setProgress(100);
      setUploadProgress(100);
      triggerNotification(`${file.name} uploaded successfully!`);
      setChangeFile(1 - changeFiles);
      console.log("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };
  async function handleDelete(fileName) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    setDeleting(fileName);
    try {
      const response = await fetch(
        `${BACKEND_URL}/delete?filename=${fileName}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        // ✅ UI se bhi hata do
        setFiles(files.filter((f) => f.file_name !== fileName));
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(null); // ✅ deleting khatam
    }
  }
  const triggerNotification = (message, type = "success") => {
    setShowNotification({ message, type });
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };
  const executeDelete = () => {
    if (fileToDelete) {
      handleDelete(fileToDelete.file_name);
      triggerNotification(
        `"${fileToDelete.file_name}" deleted successfully.`,
        "warning",
      );
      setFileToDelete(null);
    }
  };
  const handleFileInputChange = (e) => {
    //console.log(e.target.files[0])
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    // console.log(fileInputRef.current);
    // console.log("hi")
    fileInputRef.current?.click();
  };
  //const filteredFiles = [];
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.file_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeCategory === "all") return matchesSearch;
    if (activeCategory === "favorites") return file.isFavorite && matchesSearch;
    return file.category === activeCategory && matchesSearch;
  });
  //console.log(files);
  const fileInputRef = useRef(null);
  // yahi pe files ki list fetch karunga
  async function handleDownload(fileName) {
    const token = localStorage.getItem("token");

    // ✅ Check karo — browser support karta hai?
    if (window.showSaveFilePicker) {
      // Chrome — seedha disk pe likho
      await downloadWithFilePicker(fileName, token);
    } else {
      // Firefox/Safari — purana tarika
      await downloadWithBlob(fileName, token);
    }
  }

  // ✅ Chrome — RAM use nahi hogi
  async function downloadWithFilePicker(fileName, token) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
    });
    const writableStream = await fileHandle.createWritable();
    setDownloading(true); // ✅ yahan add karo — bilkul pehle
    setUploading(true);
    setProgress(0);

    const response = await fetch(
      `${BACKEND_URL}/download?filename=${fileName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const totalSize =
      parseInt(response.headers.get("X-File-Size")) ||
      parseInt(response.headers.get("Content-Length"));

    console.log("Total size:", totalSize);

    const reader = response.body.getReader();
    let receivedSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      await writableStream.write(value);
      receivedSize += value.length;

      const percent = Math.round((receivedSize / totalSize) * 100);
      console.log("Progress:", percent); // ✅ dekho ye print ho raha hai?
      setProgress(percent);
      setUploadProgress(percent);
    }

    await writableStream.close();
    setProgress(100);
    setUploadProgress(100);
    triggerNotification(`${fileName} downloaded successfully!`);
    setDownloading(false);
    setUploading(false);
    // ✅ thoda wait karo reset se pehle — user 100% dekh sake
    // setTimeout(() => setProgress(0), 2000);
  }

  // ❌ Firefox/Safari — RAM mein aayega (koi option nahi)
  async function downloadWithBlob(fileName, token) {
    const response = await fetch(
      `${BACKEND_URL}/download?filename=${fileName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const totalSize = parseInt(response.headers.get("Content-Length"));
    const reader = response.body.getReader();
    const chunks = [];
    let receivedSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedSize += value.length;
      setProgress(Math.round((receivedSize / totalSize) * 100));
    }

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    setDownloading(false);
    setProgress(0);
  }

  return (
    <div className="flex-1 min-w-0 bg-[#F1F3F5] min-h-screen px-6 py-8 md:px-10 md:py-8 overflow-y-auto">
      {/* Search & Mobile Toggle Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8 pb-6 border-b-2 border-slate-200">
        {/* Left header portion */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2.5 bg-white border-2 border-slate-900 rounded-none text-slate-900 shadow-[3px_3px_0px_#000000] hover:bg-slate-50 cursor-pointer"
            aria-label="Open side navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block">
              Workspace / {activeCategory === "all" ? "Root" : activeCategory}
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">
              GitStore
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="search-files"
            type="text"
            placeholder="SEARCH BY FILENAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-none border-2 border-slate-900 bg-white text-xs font-mono tracking-wider focus:outline-none focus:ring-0 focus:border-[#0052FF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-none hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone (With nested border overlay from design specification) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-4 border-dashed rounded-none p-10 text-center transition-all duration-150 mb-8 overflow-hidden ${
          dragActive
            ? "border-[#0052FF] bg-blue-50/20"
            : "border-slate-300 hover:border-slate-900 bg-white"
        }`}
      >
        <div className="absolute inset-2 border border-slate-200 pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          id="file-dropzone-input"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="w-10 h-10 border-2 border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none mb-4">
            <span className="text-xl font-light">+</span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Drag files here or{" "}
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-[#0052FF] font-black underline cursor-pointer hover:text-blue-700"
            >
              browse
            </button>
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest font-bold">
            Supports documents, images, audio, video
          </p>
        </div>

        {/* Drag Over Active Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-[#0052FF]/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 border-2 border-slate-950 px-4 py-2 shadow-lg">
              Release to Import File
            </span>
          </div>
        )}
      </div>

      {/* Active Upload Progress bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-4 border-slate-900 rounded-none p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-8 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 border-2 border-slate-900 bg-slate-100 rounded-none text-slate-950">
                <FileUp className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-900 truncate">
                  {uploadProgress.name}
                </p>
                <div className="w-full bg-slate-100 border-2 border-slate-900 h-4 rounded-none p-0.5 overflow-hidden mt-1.5">
                  <motion.div
                    className="bg-black h-full rounded-none"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-950">
              {progress}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar / Layout Selection */}
      <div className="flex items-center justify-between mb-5 border-b-2 border-slate-200 pb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {files.length} {files.length === 1 ? "Record" : "Records"} Detected
        </h3>
        <div className="flex items-center gap-1 bg-white p-1 border-2 border-slate-900 rounded-none">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded-none transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-slate-900 text-white"
                : "text-slate-400 hover:text-slate-900"
            }`}
            title="Grid Mode"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded-none transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-slate-900 text-white"
                : "text-slate-400 hover:text-slate-900"
            }`}
            title="List Mode"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Files Display Grid / Table */}
      {files.length === 0 ? (
        <div className="bg-white rounded-none border-2 border-slate-900 p-16 text-center">
          <div className="w-10 h-10 border-2 border-slate-950 bg-slate-50 text-slate-800 rounded-none flex items-center justify-center mx-auto mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
            No matching indexes
          </h4>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-2 max-w-[280px] mx-auto leading-relaxed">
            {searchQuery
              ? `No query match for "${searchQuery}".`
              : "Workspace is clear."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // --- Geometric Grid Layout ---
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFiles.map((file) => (
            <motion.div
              layout
              key={file.file_name}
              className="bg-white border-2 border-slate-900 rounded-none p-4 shadow-[6px_6px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-2 border-2 border-slate-900 rounded-none `} //${getCategoryBgColor(file.category)}
                  >
                    {/*getFileIcon(file.category, file.type)*/}
                  </div>

                  {/* Star Toggle-<button
                    onClick={() => onToggleFavorite(file.file_name)}
                    className={`p-1.5 border border-slate-200 hover:border-slate-900 transition-colors cursor-pointer ${
                      file.isFavorite
                        ? "text-amber-500 bg-amber-50"
                        : "text-slate-300"
                    }`}
                    title={
                      file.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>- */}
                </div>

                {/* File Title */}
                <h4
                  className="text-xs font-black uppercase tracking-wider text-slate-900 truncate mb-1"
                  title={file.file_name}
                >
                  {file.file_name}
                </h4>

                {/* Date & Size info */}
                <div className="flex flex-col gap-0.5 mb-5 text-[10px] font-mono font-bold text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    <span>
                      {new Date(file.uploaded_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <span className="mt-0.5 uppercase">
                    {formatBytes(file.file_size)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t-2 border-slate-100 pt-3">
                <button
                  onClick={() => handleDownload(file.file_name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => initiateDelete(file)}
                  className="p-2 border border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-none transition-colors cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // --- Geometric List Layout ---
        <div className="border-2 border-slate-900 bg-white rounded-none divide-y-2 divide-slate-100 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-4 border-b-2 border-slate-900 bg-slate-900 text-white relative z-10">
            <div className="p-4 text-[10px] font-black uppercase tracking-widest">
              File Name
            </div>
            <div className="p-4 text-[10px] font-black uppercase tracking-widest border-l border-white/20">
              Size
            </div>
            <div className="p-4 text-[10px] font-black uppercase tracking-widest border-l border-white/20">
              Date
            </div>
            <div className="p-4 text-[10px] font-black uppercase tracking-widest border-l border-white/20 text-right">
              Actions
            </div>
          </div>

          {/* Data Rows */}
          <div className="divide-y-2 divide-slate-100">
            {files.map((file) => (
              <div
                key={file.file_name}
                className="grid grid-cols-4 items-center hover:bg-slate-50 transition-colors group"
              >
                {/* Name column */}
                <div className="p-4 text-xs font-bold flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 border border-slate-900 flex items-center justify-center shrink-0 `} // ${getCategoryBgColor(file.category)}
                  >
                    {/*getFileIcon(file.category, file.type)*/}
                  </div>
                  <span
                    className="truncate font-black uppercase tracking-wider text-slate-800"
                    title={file.file_name}
                  >
                    {file.file_name}
                  </span>
                  {/*file.isFavorite && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                  )*/}
                </div>

                {/* Size column */}
                <div className="p-4 text-xs text-slate-500 font-mono font-bold">
                  {formatBytes(file.file_size)}
                </div>

                {/* Date column */}
                <div className="p-4 text-xs text-slate-500 uppercase font-bold">
                  {new Date(file.uploaded_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                {/* Actions column */}
                <div className="p-4 flex gap-2 justify-end">
                  {/* Star Toggle */}
                  <button
                    onClick={() => onToggleFavorite(file.file_name)}
                    className={`px-2 py-1.5 border transition-colors cursor-pointer `} /*${
                      file.isFavorite
                        ? "border-amber-500 text-amber-500 bg-amber-50"
                        : "border-slate-200 text-slate-300 hover:text-slate-500"
                    }*/
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  {/* Download */}
                  <button
                    onClick={() => handleDownload(file.file_name)}
                    className="px-3 py-1.5 bg-slate-100 text-[10px] font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-colors cursor-pointer border border-slate-200"
                  >
                    Download
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => initiateDelete(file)}
                    className="px-3 py-1.5 border border-slate-200 text-rose-500 text-[10px] font-black uppercase tracking-tighter hover:bg-rose-50 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Action Alerts / Notifications (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none space-y-2">
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`p-4 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.15)] flex items-center gap-3 text-xs font-black uppercase tracking-widest max-w-sm pointer-events-auto border-2 ${
                showNotification.type === "success"
                  ? "bg-slate-900 text-white border-slate-900"
                  : showNotification.type === "warning"
                    ? "bg-amber-50 text-amber-900 border-amber-500"
                    : "bg-rose-50 text-rose-900 border-rose-500"
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{showNotification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- CONFIRMATION DELETE DIALOG BOX --- */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToDelete(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />

            {/* Modal Dialog Box matching the theme specification exactly */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-[440px] bg-white border-4 border-slate-900 shadow-[20px_20px_0px_rgba(0,0,0,0.15)] rounded-none relative z-10"
              id="delete-confirmation-dialog"
            >
              <div className="p-10">
                <div className="w-12 h-1 border-t-4 border-rose-500 mb-6"></div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
                  Confirm Deletion
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Are you sure you want to permanently remove{" "}
                  <span className="text-slate-900 font-bold underline decoration-rose-500 decoration-2 underline-offset-4 font-mono break-all">
                    {fileToDelete.name}
                  </span>
                  ?
                </p>
              </div>
              <div className="flex border-t-4 border-slate-900">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] bg-white hover:bg-slate-50 transition-colors border-r-2 border-slate-900 cursor-pointer"
                  id="cancel-delete-btn"
                >
                  Cancel Action
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  id="confirm-delete-btn"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
