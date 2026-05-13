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
  console.log(token);
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  // const repoRes = await fetch('http://localhost:3000/repo', {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  //const repoData = await repoRes.json();
  //console.log("Repo data:", repoData);
  // Step 1 - Sab chunks parallel upload karo, blobShas collect karo
  const uploadPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    uploadPromises.push(
      fetch(`${BACKEND_URL}/upload?filename=${file.name}&index=${i}`, {
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
  //console.log("All blobs created!", results);

  // Step 2 - Commit karo
  await fetch(`${BACKEND_URL}/commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename: file.name,
      blobShas: results.map(r => ({ index: r.index, sha: r.blobSha })),
      fileSize: file.size
    })
  });
  setUploading(false);
  console.log("File committed successfully!");
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