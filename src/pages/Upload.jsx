import { useState } from "react";


function Upload() {

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDisable, setUploadDisable] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  
  
  function handleChange(e) {

    const selectedFile =
      e.target.files[0];
    //console.log(selectedFile);
    setFile(selectedFile);
    setUploadDisable(false);
  }

 async function handleUpload() {
  setUploading(true);
  const token = localStorage.getItem("token");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
  const BATCH_SIZE = 5;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  try {
    for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, totalChunks);

      // Step 1 - is batch ke chunks parallel upload karo
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
          }).then(r => r.json())
        );
      }

      const results = await Promise.all(uploadPromises);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} blobs ready`);

      // Step 2 - is batch ka commit karo
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

    console.log("File uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
  } finally {
    setUploading(false); // ✅ error pe bhi reset hoga
  }
}

  return (

    <div className="upload-container">
    
      <input
        type="file"
        onChange={handleChange}
      />

      {file && (

        <div className="upload-details">

          <p>Name: {file.name}</p>

          <p>
            Size:
            {
              (file.size / 1024)
              .toFixed(2)
            } KB
          </p>
            <button className="btn btn-primary" disabled={uploading || uploadDisable} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>

      )}

    </div>
  );
}

export default Upload;