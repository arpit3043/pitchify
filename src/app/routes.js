const express = require("express");
const profileRoutes = require("../modules/profile/routes/founderRoutes.js");
const startupRoutes = require("../modules/startup/routes/startupRoutes.js");  // Import your startup routes
const router = express.Router();

router.use("/profile", profileRoutes);

// Add startups route
router.use("/startups", startupRoutes); 

module.exports = router;
