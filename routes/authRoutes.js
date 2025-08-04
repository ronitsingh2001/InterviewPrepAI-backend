const express = require("express");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);


router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (err) {
    return res.status(500).json({ message: "Upload failed.", error: err });
  }
});

module.exports = router;
