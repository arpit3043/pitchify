const { Post } = require("../activityFeed/postModel");
const { User } = require("../auth/models/userModel");
const { Comment } = require("./commentModel");

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

module.exports = {
  createPost,
  deletePost,
  updatePostCaption,
  commentOnPost,
  deleteComment,
  updateCommentOnPost,
  getPostComments,
};
