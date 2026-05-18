import { useState } from "react";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDisable, setUploadDisable] = useState(true);
  const [progress, setProgress] = useState(0); // ✅ progress state
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  function handleChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadDisable(false);
    setProgress(0); // ✅ naya file select karo to progress reset
  }

  async function handleUpload() {
    setUploading(true);
    setProgress(0);
    const token = localStorage.getItem("token");
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
    const BATCH_SIZE = 5;
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
              method: 'POST',
              body: chunk,
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/octet-stream'
              }
            })
            .then(r => r.json())
            .then(data => {
              // ✅ har chunk complete hone pe progress update karo
              uploadedChunks++;
              setProgress(Math.round((uploadedChunks / totalChunks) * 100));
              return data;
            })
          );
        }

        const results = await Promise.all(uploadPromises);

        // Step 2 - commit
        const isLastBatch = batchEnd === totalChunks;
        await fetch(`${BACKEND_URL}/commit`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: file.name,
            blobShas: results.map(r => ({ index: r.index, sha: r.blobSha })),
            fileSize: file.size,
            isLastBatch
          })
        });

        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} committed!`);
      }

      setProgress(100);
      console.log("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="upload-container">
      <input type="file" onChange={handleChange} />

      {file && (
        <div className="upload-details">
          <p>Name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>

          {/* ✅ Progress Bar */}
          {uploading && (
            <div>
              <div style={{
                width: '100%',
                backgroundColor: '#e0e0e0',
                borderRadius: '8px',
                height: '12px',
                margin: '10px 0'
              }}>
                <div style={{
                  width: `${progress}%`,
                  backgroundColor: '#4caf50',
                  height: '12px',
                  borderRadius: '8px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p>{progress}% uploaded</p>
            </div>
          )}

          {/* ✅ Upload complete message */}
          {!uploading && progress === 100 && (
            <p style={{ color: 'green' }}>✅ Upload complete!</p>
          )}

          <button
            className="btn btn-primary"
            disabled={uploading || uploadDisable}
            onClick={handleUpload}
          >
            {uploading ? `Uploading... ${progress}%` : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;