// routes/ocrRoutes.js

const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'ocr-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

const performOCR = async (imagePath, language = 'eng') => {
  const worker = await createWorker(language);
  try {
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();
    return data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    await worker.terminate();
    throw new Error('Failed to process the image');
  }
};

router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = req.file.path;
    const language = req.body.language || 'eng';
    const extractedText = await performOCR(imagePath, language);

    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    return res.status(200).json({
      success: true,
      text: extractedText
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing image'
    });
  }
});

module.exports = router;
