
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    firebaseUID: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    lastLogin: { 
        type: Date, 
        default: Date.now 
    }
},{timestamps: true});

module.exports = mongoose.model("User", adminSchema);
