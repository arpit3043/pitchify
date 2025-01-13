const express = require('express');
const { getFilteredStartUp, getTrendingStartup } = require('../controllers/startupController.js');
const router = express.Router();

router.get("/", getFilteredStartUp) // search and filter API
router.get("/trending", getTrendingStartup) //fetch trending startups

module.exports = router;
