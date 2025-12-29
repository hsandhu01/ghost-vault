import { useState } from 'react';
import { useEncryption } from './hooks/useEncryption';
import './App.css'; 

function App() {
  const [file, setFile] = useState<File | null>(null);
  const { encryptFile, status } = useEncryption();
  const [downloadLink, setDownloadLink] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDownloadLink('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // 1. Encrypt locally
    const result = await encryptFile(file);
    if (!result) return;

    // 2. Prepare upload
    setIsUploading(true);
    const formData = new FormData();
    // We send the 'blob', not the original file!
    formData.append('encryptedFile', result.blob);

    try {
      // 3. Send to Node.js Server
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      // 4. Generate the Magic Link
      // Convert raw key to Base64 to put in URL fragment
      const keyArray = Array.from(new Uint8Array(result.exportedKey));
      const keyBase64 = btoa(String.fromCharCode(...keyArray));
      
      // The server returns a fileId. We append the key as a hash.
      // Example: http://localhost:3000/files/12345.bin#abcde...
      const link = `http://localhost:3000/files/${data.fileId}#${keyBase64}`;
      setDownloadLink(link);
      
    } catch (err) {
      console.error("Upload failed", err);
      alert("Server is likely down. Did you run 'node index.js'?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'monospace' }}>
      <h1>👻 GhostVault</h1>
      <p>Zero-Knowledge File Transfer</p>
      
      <div style={{ margin: '2rem 0', padding: '2rem', border: '2px dashed #444', borderRadius: '8px' }}>
        <input type="file" onChange={handleFileChange} />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!file || status === 'encrypting' || isUploading}
        style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer', background: '#fff', color: '#000', border: 'none', borderRadius: '4px'}}
      >
        {status === 'encrypting' ? 'Encrypting...' : isUploading ? 'Uploading...' : 'Encrypt & Upload'}
      </button>

      {downloadLink && (
        <div style={{ marginTop: '2rem', textAlign: 'left', background: '#222', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#0f0', margin: '0 0 0.5rem 0' }}>✅ File Secured!</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Only people with this link can decrypt it:</p>
          <div style={{ background: '#000', padding: '10px', wordBreak: 'break-all', border: '1px solid #444' }}>
            <a href={downloadLink} target="_blank" style={{ color: '#4facfe' }}>{downloadLink}</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
