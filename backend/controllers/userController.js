const User = require("../models/user");

// Register or login a user with Firebase authentication
exports.registerOrLogin = async (req, res) => {
  try {
    const { name, email, firebaseUID } = req.body;

    console.log("Received auth request:", { name, email, firebaseUID });

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update login time
      console.log("Updating existing user:", email);
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      console.log("Creating new user:", email);
      user = new User({
        name,
        email,
        firebaseUID,
        lastLogin: new Date(),
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in user authentication:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message,
    });
  }
};

exports.saveDocument = async (req, res) => {
  try {
    const { firebaseUID, document } = req.body;

    console.log("Received save request:", {
      firebaseUID,
      documentName: document.name,
      hasContent: !!document.content,
    });

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Validate and sanitize document name
    if (!document.name) {
      // Generate fallback name if none provided
      document.name = `Document_${new Date().toISOString().split("T")[0]}`;
    }

    // Ensure name is not too long
    if (document.name.length > 100) {
      document.name = document.name.substring(0, 97) + "...";
    }

    user.documents.push(document);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Document saved successfully",
      documentName: document.name,
    });
  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving document",
      error: error.message,
    });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      documents: user.documents.map((doc) => ({
        id: doc._id,
        name: doc.name,
        uploadDate: doc.uploadDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching documents",
      error: error.message,
    });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const { firebaseUID, documentId } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const document = user.documents.id(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching document",
      error: error.message,
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { firebaseUID, documentId } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find and remove the document
    const documentIndex = user.documents.findIndex(
      (doc) => doc._id.toString() === documentId
    );

    if (documentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    user.documents.splice(documentIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting document",
      error: error.message,
    });
  }
};
