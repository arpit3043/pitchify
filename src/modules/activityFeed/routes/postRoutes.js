const express = require("express");
const postController = require("../postController");
const { isAuthenticated } = require("../../../middlewares/auth");
const router = express.Router();

router
  .route("/post/createPost")
  .post(isAuthenticated, postController.createPost);

router
  .route("/post/:id")
  .get()
  .delete(isAuthenticated, postController.deletePost)
  .put(isAuthenticated, postController.updatePostCaption);

//add comment routes on post
router
  .route("/post/:postId/comments")
  .get(isAuthenticated, postController.getPostComments)
  .post(isAuthenticated, postController.commentOnPost);

router
  .route("/post/:postId/comments/:commentId")
  .put(isAuthenticated, postController.updateCommentOnPost)
  .delete(isAuthenticated, postController.deleteComment);

module.exports = router;
