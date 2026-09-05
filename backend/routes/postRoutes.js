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

// Get all posts - Public
router.get("/", getPosts);

// Create post - Login required
router.post("/", protect, upload.single("image"), createPost);

// Like / Unlike post - Login required
router.post("/:id/like", protect, toggleLike);

// Add comment - Login required
router.post("/:id/comment", protect, addComment);

module.exports = router;