const { Post } = require("../activityFeed/postModel");
const { User } = require("../auth/models/userModel");
const { Comment } = require("./commentModel");

/**
 * Post Management Controllers
 */

// Creates a new post and associates it with the user
const createPost = async (req, res, next) => {
  try {
    //collect new Post Data in an object
    const newPostData = {
      caption: req.body.caption,
      owner: req.user._id,
    };
    //create a new Post
    const newPost = await Post.create(newPostData);

    const user = await User.findById(req.user._id);
    //add post id to the user object who created the post
    user.posts.unshift(newPost._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Post created",
      newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

// Deletes a post and removes it from user's posts array
// Validates post ownership before deletion
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

// Updates post caption after verifying ownership
const updatePostCaption = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //unauthorized user accessing the post
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to Update",
      });
    }

    post.caption = req.body.caption;
    await post.save();

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
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const newCommentData = {
      content,
      postId,
      owner: userId,
    };

    const comment = await Comment.create(newCommentData);

    post.comments.push(comment._id);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment added",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
        message: "Post not found"
      });
    }

    const comments = await Comment.find({ postId })
      .populate('owner', 'name') // Populate author details (e.g., name)
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
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Post not found"
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if comment belongs to the post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post"
      });
    }

    // Check if user has already liked the comment
    const likeIndex = comment.likes.findIndex(like => 
      like.user.toString() === userId.toString()
    );

    if (likeIndex !== -1) {
      // User has already liked - remove the like
      comment.likes.splice(likeIndex, 1);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: "Comment unliked successfully",
        likes: comment.likes.length
      });
    }

    // Add new like
    comment.likes.push({
      user: userId,
      likedAt: new Date()
    });

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      likes: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all controllers
module.exports = {
  createPost,
  deletePost,
  updatePostCaption,
  commentOnPost,
  deleteComment,
  updateCommentOnPost,
  getPostComments,
  likeComment
};
