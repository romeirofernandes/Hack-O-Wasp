// routes/index.js
const userRoutes = require("./userRoutes");
const ocrRoutes = require("./ocrRoutes");
const uploadRoutes = require("./upload");
const transcribeRoutes = require("./transcribe");

module.exports = {
  userRoutes,
  ocrRoutes,
  uploadRoutes,
  transcribeRoutes,
};
