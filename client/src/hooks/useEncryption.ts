import { useState } from 'react';

export const useEncryption = () => {
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);

  const generateKey = async () => {
    return await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const encryptFile = async (file: File) => {
    try {
      setStatus('encrypting');
      setError(null);

      const key = await generateKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const fileBuffer = await file.arrayBuffer();

      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        fileBuffer
      );

      const exportedKey = await window.crypto.subtle.exportKey("raw", key);
      const blob = new Blob([iv, encryptedContent], { type: 'application/octet-stream' });

      setStatus('done');
      return { blob, exportedKey, iv };
      
    } catch (err) {
      setError('Encryption failed');
      console.error(err);
      setStatus('error');
      return null;
    }
  };

  return { encryptFile, status, error };
};