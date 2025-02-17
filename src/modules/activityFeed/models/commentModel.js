const mongoose = require("mongoose");

/**
 * Comment Schema Definition
 * Represents the structure of comments in the activity feed
 */
const commentSchema = new mongoose.Schema({
  // Links comment to specific post
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },

  // Comment author reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Refers to the user who made the comment
    required: true,
  },

  // Main comment text
  comment: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends
  },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      likedAt: { type: Date, default: Date.now },
    },
  ],

  // Nested replies structure
  // Allows for threaded conversations under comments
  replies: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date },
      likes: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          likedAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],

  // Tracks users who liked the comment and when

  // Timestamp tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Create and export the Comment model
const Comment = mongoose.model("Comment", commentSchema);
module.exports = { Comment };
