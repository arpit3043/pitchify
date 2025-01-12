const express = require("express");
const postController = require("../postController");
const { isAuthenticated } = require("../../../middlewares/auth");
const router = express.Router();

/**
 * Post Management Routes
 * All routes are protected with authentication middleware
 */

// Post Creation
router
  .route("/post/createPost")
  .post(isAuthenticated, postController.createPost);

// Post Management (Delete, Update)
router
  .route("/post/:id")
  .get()  // TODO: Implement get single post endpoint
  .delete(isAuthenticated, postController.deletePost)
  .put(isAuthenticated, postController.updatePostCaption);

/**
 * Comment Management Routes
 */

// Comment List and Creation
// GET: Retrieves paginated comments for a post
// POST: Adds new comment to a post
router
  .route("/post/:postId/comments")
  .get(isAuthenticated, postController.getPostComments)
  .post(isAuthenticated, postController.commentOnPost);

// Individual Comment Operations
// PUT: Updates existing comment
// DELETE: Removes comment from post
router
  .route("/post/:postId/comments/:commentId")
  .put(isAuthenticated, postController.updateCommentOnPost)
  .delete(isAuthenticated, postController.deleteComment);

// Comment Interaction
// Handles liking/unliking comments
router.post(
  "/post/:postId/comments/:commentId/like",
  isAuthenticated,
  postController.likeComment
);

module.exports = router;
