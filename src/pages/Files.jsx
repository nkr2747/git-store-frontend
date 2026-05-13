import "../Second.css";
import { useState, useEffect } from "react";
export function Files() {
  const [inputFile, setInputFile] = useState("");
  const [files, setFiles] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  async function handleDelete(fileName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`,
    );
    if (!confirmed) return;

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

  const response = await fetch(`${BACKEND_URL}/download?filename=${fileName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const totalSize = parseInt(response.headers.get("Content-Length"));
  const reader = response.body.getReader();
  let receivedSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    await writableStream.write(value);
    receivedSize += value.length;
    setProgress(Math.round((receivedSize / totalSize) * 100));
  }

  await writableStream.close();
  setDownloading(false);
  setProgress(0);
}

// ❌ Firefox/Safari — RAM mein aayega (koi option nahi)
async function downloadWithBlob(fileName, token) {
  const response = await fetch(`${BACKEND_URL}/download?filename=${fileName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    async function getFiles() {
      try {
        const response = await fetch(`${BACKEND_URL}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setFiles(data); // ✅
        //console.log("Fetched data:", data);
        //console.log("Fetched files:", files);
      } catch (error) {
        console.error("Error fetching files:", error);
        window.location.href = "/";
      }
    }

    getFiles();
  }, []);
  function handleFileChange(event) {
    setInputFile(event.target.value);
  }
  return (
    <div className="myfiles-container">
      <div className="m-3">
        <input
          type="text"
          value={inputFile}
          className="form-control"
          id="formGroupExampleInput"
          placeholder="Search files..."
          onChange={handleFileChange}
        />
      </div>
      <div className="files-list">
        {files.map((value, index) => (
          <div className="file-item" key={index}>
            <span className="file-name">{value.file_name}</span>
            <span>{(value.file_size / (1024 * 1024)).toFixed(2)} MB</span>
            <span>
              {new Date(value.uploaded_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </span>
            <div className="file-actions">
              <button
                className="btn-download"
                onClick={() => handleDownload(value.file_name)}
              >
                ⬇ Download
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(value.file_name)}
                disabled={deleting === value.file_name}
              >
                {deleting === value.file_name ? "Deleting..." : "🗑 Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Progress bar */}
      {downloading && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.8)",
            padding: "15px 20px",
            borderRadius: "8px",
            border: "1px solid #2dd4bf",
            color: "#e2e8f0",
            minWidth: "250px",
          }}
        >
          <div style={{ marginBottom: "8px", fontSize: "13px" }}>
            Downloading... {progress}%
          </div>
          <div
            style={{
              background: "#1e293b",
              borderRadius: "4px",
              height: "6px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#2dd4bf",
                borderRadius: "4px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
