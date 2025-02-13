// src/modules/recommendations/recommendations.routes.js

const express = require('express');
const router = express.Router();

// Import your controllers
const {
  getFounderRecommendationsByUserId,
  getInvestorRecommendationsByUserId,
  getGeneralRecommendations,
} = require('./recommendations.controller');

// Import your auth middleware
const { isAuthenticated } = require('../auth/isAuthenticated'); // Adjust path as needed

/**
 * GET /recommendations
 * - Checks req.user.role from the token
 * - If 'founder', calls getFounderRecommendationsByUserId
 * - If 'investor', calls getInvestorRecommendationsByUserId
 * - Otherwise, calls getGeneralRecommendations
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'founder') {
      return getFounderRecommendationsByUserId(req, res);
    } else if (userRole === 'investor') {
      return getInvestorRecommendationsByUserId(req, res);
    } else {
      // "enthusiast" or any other role
      return getGeneralRecommendations(req, res);
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
