const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { createWorker } = require("tesseract.js");
const pdf2img = require("pdf2img"); // For converting PDF to images

const router = express.Router();
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // Set a file size limit of 10MB
});

const worker = createWorker();

// Route to handle file uploads
router.post("/ocr", upload.single("file"), async (req, res) => {
  const file = req.file;
  const fileType = file.mimetype;

  try {
    if (fileType.includes("pdf")) {
      // Convert PDF to image
      pdf2img.convert(file.path, { format: "png" }, async (err, images) => {
        if (err) {
          console.error("Error converting PDF to images:", err);
          return res.status(500).send("Error processing PDF");
        }
        if (images.length === 0) {
          return res.status(400).send("No images generated from the PDF.");
        }

        // Process the images from PDF
        let fullText = '';
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");

        for (const image of images) {
          const { data: { text } } = await worker.recognize(image.path);
          fullText += text + '\n';
        }

        await worker.terminate();
        return res.json({ success: true, text: fullText });
      });
    } else if (fileType.includes("image")) {
      // Process image file directly with OCR
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const { data: { text } } = await worker.recognize(file.path);
      await worker.terminate();

      return res.json({ success: true, text });
    } else {
      return res.status(400).send("Invalid file type. Only PDF or image files are allowed.");
    }
  } catch (err) {
    console.error("Error processing file:", err);
    return res.status(500).send({ message: "Error processing file", error: err.message });
  } finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path); // Clean up uploaded file
    }
  }
});

module.exports = router;
