const express = require("express");
const founderController = require("../controllers/founderController");
const { isAuthenticated, isRole } = require("../../../middlewares/auth");
const handleFileUpload = require("../../../middlewares/fileUpload");

const router = express.Router();

// Protected routes
router.use(isAuthenticated); // Apply authentication to all routes below
// Create founder profile
router.post("/", founderController.registerFounder);

// Get founder profile by ID
router.get("/:id", founderController.getFounderProfile);

// Update founder profile
router.put("/:id", isRole("founder"), founderController.updateFounderProfile);

// Delete founder profile
router.delete("/:id", isRole("founder"), founderController.deleteFounderProfile);

// File upload routes
router.post(
  "/:id/upload/pitch-deck",
  isRole("founder"),
  handleFileUpload.single("pitchDeck"),
  founderController.uploadPitchDeck
);

router.post(
  "/:id/upload/product-demos",
  isRole("founder"),
  handleFileUpload.array("productDemos", 3),
  founderController.uploadProductDemos
);

router.post(
  "/:id/upload/multimedia",
  isRole("founder"),
  handleFileUpload.array("multimedia", 5),
  founderController.uploadMultimedia
);

// router.route("/follow/:id").post(isAuthenticated, founderController.followUser);

module.exports = router
