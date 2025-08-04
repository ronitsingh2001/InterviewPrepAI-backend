require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const { protect } = require("./middleware/authMiddleware");
const { generateInterviewQuestion, generateConceptExplanation } = require("./controllers/aiController");

const app = express();

// cors middleware
app.use(
  cors({
    origin: "*",
    method: ["GET", "POST", "PUT", "DELETE"],
    allowedHeader: ["Content-Type", "Authorization"],
  })
);

connectDB();

// JSON PARSE Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/session', sessionRoutes)
app.use('/api/question', questionRoutes)

app.use('/api/ai/generate-questions', protect, generateInterviewQuestion)
app.use('/api/ai/generate-explanation', protect, generateConceptExplanation)

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
