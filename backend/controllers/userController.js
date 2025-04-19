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
        lastLogin: new Date()
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user
    });
  } catch (error) {
    console.error("Error in user authentication:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message
    });
  }
};
