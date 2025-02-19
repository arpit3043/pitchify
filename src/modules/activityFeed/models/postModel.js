const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    media: [{ type: String }], // URLs for images/videos
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hashtags: [{ type: String, required: true }],
    shares: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Reference to Comment model
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
