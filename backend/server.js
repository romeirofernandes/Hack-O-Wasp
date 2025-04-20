const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/upload");
const transcribeRoutes = require("./routes/transcribe");
const streakRoutes = require("./routes/streakRoutes");
const deckRoutes = require("./routes/deckRoutes");
const userRoutes = require("./routes/userRoutes");
const revisionRoutes = require("./routes/revision");
require("dotenv").config();

const app = express();

connectDB();

app.use(
  cors({
    origin: "https://clarity-ai-virid.vercel.app",
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
app.use("/api/decks", deckRoutes);

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
