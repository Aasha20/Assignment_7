const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/profile_pics')); // Define upload folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname; // Add timestamp for uniqueness
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File type not supported!'));
  }
});

// Middleware to verify JWT
function authenticateJWT(req, res, next) {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = decoded;
    next();
  });
}

// Profile picture route
router.put('/edit-profile-pic', authenticateJWT, upload.single('profile_pic'), async (req, res) => {
  // Check if the file was uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Successful upload
  res.json({
    message: 'File uploaded successfully!',
    file: req.file // File details
  });
});

module.exports = router;