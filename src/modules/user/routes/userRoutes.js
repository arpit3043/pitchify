const express = require("express");
const userController = require("../controllers/userControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

router.route("/:id").get(isAuthenticated, userController.viewUser);
router.route("/:id/follow").post(isAuthenticated, userController.followUser);
router
  .route("/:id/unfollow")
  .post(isAuthenticated, userController.unfollowUser);

module.exports = router;
