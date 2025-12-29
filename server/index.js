const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS so our React app (port 5173) can hit this server (port 3000)
app.use(cors());

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Storage (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // We give it a random name. The original filename is encrypted inside the blob anyway!
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.bin'); 
  }
});

const upload = multer({ storage: storage });

// The Upload Endpoint
app.post('/upload', upload.single('encryptedFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`[Vault] Stored encrypted object: ${req.file.filename} (${req.file.size} bytes)`);
  
  // Return the ID so the client can generate the share link
  res.json({ 
    fileId: req.file.filename,
    message: "File secure. Server cannot decrypt this content." 
  });
});

// The Download Endpoint
app.get('/files/:id', (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  🔒 GhostVault Server running on http://localhost:${PORT}
  ----------------------------------------------------
  Listening for encrypted blobs...
  `);
});