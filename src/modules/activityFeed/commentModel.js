const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Refers to the associated post
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the user who made the comment
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    }
  ],
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      likedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});


const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment };
