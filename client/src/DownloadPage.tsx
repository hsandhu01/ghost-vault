import { useEffect, useState } from 'react';

export const DownloadPage = () => {
  const [status, setStatus] = useState('Checking URL...');
  
  useEffect(() => {
    const decryptAndDownload = async () => {
      // 1. Parse URL: Get File ID from path and Key from hash
      const fileId = window.location.pathname.split('/').pop();
      const keyBase64 = window.location.hash.substring(1); // Remove '#'

      if (!fileId || !keyBase64) {
        setStatus("Invalid Link: Missing ID or Key");
        return;
      }

      try {
        setStatus("Downloading Encrypted Blob...");
        // 2. Fetch the encrypted .bin file
        const response = await fetch(`http://localhost:3000/files/${fileId}.bin`);
        if (!response.ok) throw new Error("File not found on server");
        const encryptedBlob = await response.blob();
        
        setStatus("Decrypting...");
        
        // 3. Import the Key back from Base64
        const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
        const key = await window.crypto.subtle.importKey(
          "raw", 
          keyBytes, 
          "AES-GCM", 
          true, 
          ["decrypt"]
        );

        // 4. Separate IV (first 12 bytes) from Data
        const arrayBuffer = await encryptedBlob.arrayBuffer();
        const iv = arrayBuffer.slice(0, 12);
        const data = arrayBuffer.slice(12);

        // 5. Decrypt
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          data
        );

        // 6. Force Browser to Download the Clean File
        const cleanBlob = new Blob([decryptedBuffer]);
        const url = URL.createObjectURL(cleanBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decrypted-${Date.now()}.png`; // Simple default name
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        
        setStatus("Success! File Downloaded.");

      } catch (err) {
        console.error(err);
        setStatus("Decryption Failed! Key might be wrong.");
      }
    };

    decryptAndDownload();
  }, []);

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>🔐 Secure Downloader</h1>
      <h2>{status}</h2>
    </div>
  );
};