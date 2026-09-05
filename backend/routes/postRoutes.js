const express = require("express");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Image must be 5 MB or smaller"
      : error.message || "Unable to process the uploaded image";

    res.status(400).json({ message });
  });
};

// Get all posts - Public
router.get("/", getPosts);

// Create post - Login required
router.post("/", protect, uploadSingleImage, createPost);

// Like / Unlike post - Login required
router.post("/:id/like", protect, toggleLike);

// Add comment - Login required
router.post("/:id/comment", protect, addComment);

module.exports = router;