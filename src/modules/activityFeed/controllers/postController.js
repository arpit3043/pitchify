const { Post } = require("../models/postModel");
const { User } = require("../../auth/models/userModel");
const { Comment } = require("../models/commentModel");
const cloudinary = require("../../../utils/cloudinary");
const {
  extractHashtags,
  updateTrendingTopics,
  handlePostDeletion,
  handlePostUpdate,
} = require("../../../utils/trendingTopicsHelper");

/*
Route to create a post along with file upload if any.
*/
const createPost = async (req, res) => {
  try {
    const author = req.user?.id; // Ensure req.user exists
    if (!author) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please log in." });
    }

    const { content } = req.body;
    const hashtags = extractHashtags(content);

    const user = await User.findById(author);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found. Login Again!" });
    }

    // Upload media to Cloudinary
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      ("req.files.length");
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "posts_media",
          resource_type: "auto",
        });
        mediaUrls.push(result.secure_url);
      }
    }

    // Create a new post
    const newPost = new Post({
      author,
      content,
      media: mediaUrls,
      hashtags,
    });

    await newPost.save();

    if (!user.posts) {
      user.posts = [];
    }
    user.posts.unshift(newPost._id);
    await user.save();

    // Update trending hashtags
    for (const hashtag of hashtags) {
      await updateTrendingTopics(hashtag, newPost._id);
    }

    res.status(201).json({
      success: true,
      message: "Post created",
      post: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/*
Route to fetch all the posts for the activity feed of any user.
For now the latest posts of it's followings are fetched.
*/
const fetchAllPost = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Fetch all posts except those created by the requesting user
    const totalPosts = await Post.countDocuments({ author: { $ne: userId } });

    const posts = await Post.find({ author: { $ne: userId } })
      .populate("author", "name title profileImg userType createdAt updatedAt")
      .populate(
        "comments.user",
        "name title profileImg userType createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/*
Route to fetch a user post for a provided post id.
*/
const fetchPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name title profileImg userType createdAt updatedAt")
      .populate(
        "comments.user",
        "name title profileImg userType createdAt updatedAt"
      );
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post Not Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Post retrieval Success",
      post: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/*
Route to update a user post for a provided post id.
*/
const updatePostById = async (req, res, next) => {
  try {
    const updatesForPost = req.body;
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post Not Found" });
    }
    const oldHashtags = extractHashtags(existingPost.content || "");
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...updatesForPost,
          hashtags: extractHashtags(updatesForPost.content) || oldHashtags,
        },
      },
      { new: true, runValidators: true }
    );
    const newHashtags = extractHashtags(updatesForPost.content || "");
    await updateTrendingTopics(oldHashtags, newHashtags);

    return res.status(200).json({
      success: true,
      message: "Post Update Successfully",
      post: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hashtags = post.hashtags;
    await handlePostDeletion(post._id, hashtags);

    await post.deleteOne({ _id: req.params.id });

    const user = await User.findById(req.user._id);
    const indexOfPostInUser = user.posts.indexOf(req.params.id);
    user.posts.splice(indexOfPostInUser, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

const updatePostCaption = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //unauthorized user accessing the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to Update",
      });
    }

    const oldHashtags = post.hashtags;
    const newHashtags = extractHashtags(content);

    post.content = content;
    post.hashtags = newHashtags;

    await post.save();
    await handlePostUpdate(post._id, oldHashtags, newHashtags);

    res.status(200).json({
      success: true,
      message: "Post Updated",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

/**
 * Comment Management Controllers
 */

// Adds a new comment to a post
// Validates:
// 1. Post existence
// 2. User existence
// 3. Comment content presence
const commentOnPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { comment } = req.body;

    // Validate input
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty" });
    }

    // Find the post
    const post = await Post.findById(postId)
      
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    // Find the user
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // ✅ Create the comment and save it separately
    const newComment = new Comment({
      postId,
      user: userId, // Store reference to the user
      comment,
    });

    await newComment.save(); // Save to database

    // ✅ Push only the Comment's ID to post.comments
    post.comments.push(userId);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Deletes a comment from a post
// Validates:
// 1. Post and comment existence
// 2. Comment belongs to the specified post
// 3. User is either comment owner or post owner
const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    //check if comment belongs to the specified post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post",
      });
    }

    //checking if user is owner of the comment or the post owner
    if (!comment.owner.equals(userId) && !post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete the comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    post.comments.pull(commentId);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "comment deleted",
      commentDeletedBy: userId,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Updates an existing comment
// Validates:
// 1. Post and comment existence
// 2. Comment belongs to specified post
// 3. Only comment owner can update
const updateCommentOnPost = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    //check if comment belongs to the specified post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post",
      });
    }

    //checking if user is owner of the comment or the post owner
    if (!comment.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to update the comment",
      });
    }

    const { content } = req.body;

    const updatedCommentData = {
      content,
    };
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updatedCommentData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "comment Updated",
      updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Comment Retrieval Controller
 */

// Fetches paginated comments for a post
// Features:
// 1. Pagination support
// 2. Populates comment author details
// 3. Sorts by creation date (newest first)
// 4. Returns pagination metadata
const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    // Fetch comments with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comments = await Comment.find({ postId })
      .populate("user", "name title profileImg userType createdAt updatedAt")
      .populate(
        "replies.author",
        "name title profileImg userType createdAt updatedAt"
      )

      // Populate author details (e.g., name)
      .sort({ createdAt: -1 }) // Sort comments by creation date in descending order
      .skip(skip) // Skip the first 'skip' comments
      .limit(limit); // Limit the number of comments to 'limit'

    const totalComments = await Comment.countDocuments({ postId });
    const totalPages = Math.ceil(totalComments / limit);

    return res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Handles comment likes/unlikes
// Features:
// 1. Toggles like status (likes/unlikes)
// 2. Validates post and comment existence
// 3. Verifies comment belongs to post
// 4. Tracks like timestamp
const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id; // Ensure userId is valid

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Convert userId to string
    const userIdStr = userId.toString();

    // Check if user already liked the post
    if (post.likes.includes(userIdStr)) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Like removed",
        likes: post.likes,
      });
    }

    // Add like
    post.likes.push(userIdStr);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Liked successfully",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/**
 * Comment Interaction Controller
 */

// Handles comment likes/unlikes
// Features:
// 1. Toggles like status (likes/unlikes)
// 2. Validates post and comment existence
// 3. Verifies comment belongs to post
// 4. Tracks like timestamp
const likeComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if comment belongs to the post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post",
      });
    }

    // Check if user has already liked the comment
    const likeIndex = comment.likes.findIndex(
      (like) => like.user.toString() === userId.toString()
    );

    if (likeIndex !== -1) {
      // User has already liked - remove the like
      comment.likes.splice(likeIndex, 1);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: "Comment unliked successfully",
        likes: comment.likes.length,
      });
    }

    // Add new like
    comment.likes.push({
      user: userId,
      likedAt: new Date(),
    });

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      likes: comment.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addReplyToComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Validate input
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Reply content cannot be empty" });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create the reply object
    const newReply = {
      author: userId, // Store reference to the user
      content,
    };

    // Add the reply to the comment's replies array
    comment.replies.push(newReply);
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  deletePost,
  updatePostCaption,
  commentOnPost,
  deleteComment,
  updateCommentOnPost,
  fetchAllPost,
  fetchPostById,
  getPostComments,
  updatePostById,
  likePost,
  likeComment,
  addReplyToComment,
};
