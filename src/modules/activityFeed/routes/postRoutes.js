const express = require("express");
const postController = require("../controllers/postController");
const { isAuthenticated } = require("../../../middlewares/auth");
const upload=require('../../../utils/multer');
const router = express.Router();

router
  .route("/post/createPost")
  .post(isAuthenticated,upload.array('media',5), postController.createPost);

router
  .route("/post/")
  .get(isAuthenticated,postController.fetchAllPost);

router
  .route("/post/:id")
  .get(isAuthenticated,postController.fetchPostById)
  .delete(isAuthenticated, postController.deletePost)
  .put(isAuthenticated, postController.updatePostById);

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
