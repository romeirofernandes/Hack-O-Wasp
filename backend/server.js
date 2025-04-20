const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/upload");
const transcribeRoutes = require("./routes/transcribe");
const streakRoutes = require("./routes/streakRoutes");
const revisionRoutes = require("./routes/revision");
require("dotenv").config();

const app = express();

// Import routes
const userRoutes = require("./routes/userRoutes");
const streak = require("./models/streak");

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
// Increase JSON payload size limit to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/api/upload", uploadRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/streak", streakRoutes);
// Use routes
app.use("/api/users", userRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
