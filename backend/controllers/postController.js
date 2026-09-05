const Post = require("../models/Post");
const { uploadBuffer } = require("../config/cloudinary");
const { prepareImageBuffer } = require("../middleware/uploadMiddleware");

// Create Post
const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    let image = "";

    if (req.file) {
      const imageBuffer = await prepareImageBuffer(req.file);
      const uploadResult = await uploadBuffer(imageBuffer, {
        folder: "socially-posts",
        resource_type: "image",
      });
      image = uploadResult.secure_url;
    }

    if (!text?.trim() && !image) {
      return res.status(400).json({
        message: "Post must contain text or an image",
      });
    }

    const post = await Post.create({
      userId: req.user.userId,
      username: req.user.username,
      text: text?.trim() || "",
      image,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    if (error.code === "IMAGE_CONVERSION_FAILED") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a page of posts
const getPosts = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 10;
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Like / Unlike Post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const existingLike = post.likes.find(
      (like) => like.userId.toString() === req.user.userId
    );

    if (existingLike) {
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== req.user.userId
      );
    } else {
      post.likes.push({
        userId: req.user.userId,
        username: req.user.username,
      });
    }

    await post.save();

    res.json({
      message: existingLike ? "Post unliked" : "Post liked",
      likes: post.likes,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      userId: req.user.userId,
      username: req.user.username,
      text: text.trim(),
    });

    await post.save();

    res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};