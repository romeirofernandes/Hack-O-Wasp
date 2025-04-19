const express = require("express");
const router = express.Router();
const {
  registerOrLogin,
  saveDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
} = require("../controllers/userController");

router.post("/auth", registerOrLogin);
router.post("/save-document", saveDocument);
router.get("/:firebaseUID/documents", getUserDocuments);
router.get("/:firebaseUID/documents/:documentId", getDocumentById);
router.delete('/:firebaseUID/documents/:documentId', deleteDocument);

module.exports = router;
