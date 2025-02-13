const express = require("express");
const investorControllers = require("../controllers/investorControllers");
const { isAuthenticated } = require("../../../middlewares/auth");

const router = express.Router();

console.log("investorRoutes");
// Protected routes
router.use(isAuthenticated); // Apply authentication to all routes below
// Create investor profile
router.post("/", investorControllers.registerInvestor);

// Update investor profile
router.put("/:id", investorControllers.updateInvestorProfile);

// Delete investor profile
router.delete("/:id", investorControllers.deleteInvestorProfile);

// Get investor profile
router.get("/:id", investorControllers.getInvestorProfile);

// router.route("/follow/:id").post(isAuthenticated, founderController.followUser);

module.exports = router