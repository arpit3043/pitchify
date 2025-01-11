const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String, //basic url to path of the media
        required: false,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId, //basic list of user ids
        ref: "User",
      },
    ],
    hashtags: [
      {
        type: String,
        required: true,
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, //for auto adding of updated and created fields in db
  }
);

// PostSchema.index({author:1});
const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
