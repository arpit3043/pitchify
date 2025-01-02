const express = require("express");
const profileRoutes = require("../modules/profile/routes/founderRoutes.js");

const router = express.Router();

router.use("/profile", profileRoutes);

module.exports = router;
