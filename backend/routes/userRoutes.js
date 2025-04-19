const express = require("express");
const router = express.Router();
const {
  registerOrLogin,
  saveDocument,
  getUserDocuments,
  getDocumentById,
} = require("../controllers/userController");

router.post("/auth", registerOrLogin);
router.post("/save-document", saveDocument);
router.get("/:firebaseUID/documents", getUserDocuments);
router.get("/:firebaseUID/documents/:documentId", getDocumentById);

module.exports = router;
