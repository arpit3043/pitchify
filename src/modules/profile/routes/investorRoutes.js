const express = require("express");
const investorController = require("../controllers/investorController");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

// router.route("/login").post(loginUser);

router.route("/register").post(investorController.registerInvestor);
router.route("/login").post(investorController.loginInvestor);
router.route("/logout").post(investorController.logoutInvestor);

// router.route("/follow/:id").post(isAuthenticated, founderController.followUser);

module.exports = router;
