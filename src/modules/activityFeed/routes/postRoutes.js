const express = require("express");
const postController = require("../controllers/postController");
const { isAuthenticated } = require("../../../middlewares/auth");
const upload = require("../../../utils/multer");
const router = express.Router();

router
  .route("/post/createPost")
  .post(isAuthenticated, upload.array("media", 5), postController.createPost);

router.route("/post").get(isAuthenticated, postController.fetchAllPost);

router
  .route("/post/:id")
  .get(isAuthenticated, postController.fetchPostById)
  .delete(isAuthenticated, postController.deletePost)
  .put(isAuthenticated, postController.updatePostById);

router
  .route("/post/:id/edit")
  .patch(isAuthenticated, postController.updatePostCaption);

//add comment routes on post
router
  .route("/post/:postId/comments")
  .get(isAuthenticated, postController.getPostComments)
  .post(isAuthenticated, postController.commentOnPost);
router
  .route("/post/:postId/like")
  .post(isAuthenticated, postController.likePost);

router
  .route("/post/:postId/comments/:commentId")
  .put(isAuthenticated, postController.updateCommentOnPost)
  .delete(isAuthenticated, postController.deleteComment);

router
  .route("/post/:postId/comments/:commentId/replies")
  .post(isAuthenticated, postController.addReplyToComment);


  // Comment Interaction
// Handles liking/unliking comments
router.post(
  "/post/:postId/comments/:commentId/like",
  isAuthenticated,
  postController.likeComment
);

module.exports = router;


