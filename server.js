const express = require('express');
const path = require('path');
const mime = require('mime');

const app = express();
const PORT = 5173;

// Define MIME type for .gltf
mime.define({ 'model/gltf+json': ['gltf'] }, true);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.gltf')) {
        res.setHeader('Content-Type', 'model/gltf+json');
      }
    }
  }));
