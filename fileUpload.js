const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;
app.use(express.json());


// Enable file upload middleware
app.use(fileUpload());

// Store uploaded files
const uploadedFiles = {};

// Upload API
app.put('/upload', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.files.file;

  // Check file type (JPEG/PNG)
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return res.status(400).json({ message: 'File type not supported. Only JPEG and PNG are allowed.' });
  }

  // Check file size (1MB limit)
  if (file.size > 1000000) {
    return res.status(400).json({ message: 'File size exceeds the 1MB limit' });
  }

  const fileId = Date.now().toString();
  const uploadPath = path.join(__dirname, 'uploads', fileId + path.extname(file.name));

  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed' });
    }

    uploadedFiles[fileId] = uploadPath;
    return res.status(200).json({ message: 'File upload Successfull', fileId });
  });
});

// Delete file API
app.delete('/delete-file/:fileId', (req, res) => {
  const fileId = req.params.fileId;

  if (uploadedFiles[fileId]) {
    const filePath = uploadedFiles[fileId];
    fs.unlinkSync(filePath);
    delete uploadedFiles[fileId];
    res.json({ message: 'File deleted successfully' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Rename file API
app.post('/rename-file/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const newName = req.body.newName;

  if (uploadedFiles[fileId]) {
    const filePath = uploadedFiles[fileId];
    const extname = path.extname(filePath);
    const newFilePath = path.join(path.dirname(filePath), newName + extname);

    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'File renaming failed' });
      }

      uploadedFiles[fileId] = newFilePath;
      res.json({ message: 'File renamed successfully' });
    });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Create an 'uploads' directory for storing files
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
