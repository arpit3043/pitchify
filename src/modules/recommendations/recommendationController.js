// src/modules/recommendations/recommendations.controller.js

const Founder = require('../profile/Founder');   // Adjust the path to your Founder model
const Investor = require('../profile/Investor'); // Adjust the path to your Investor model
const { computeMatchScore } = require('./recommendations.service');

/*
 * For a user with role "founder", find their Founder document by userId,
 * then find all investors and compute match scores.
*/
async function getFounderRecommendationsByUserId(req, res) {
  try {
    // 1. Find the founder document by userId (from the token)
    const founder = await Founder.findOne({ userId: req.user.id });
    if (!founder) {
      return res.status(404).json({
        success: false,
        message: 'No founder profile found for this user',
      });
    }

    // 2. Find all investors
    const investors = await Investor.find({});
    // 3. Compute match scores : {acc to profile}
    const matches = investors.map((investor) => ({
        investor,
        score: computeMatchScore(founder, investor),
    }));

    
    // 4. Sort by descending score
    matches.sort((a, b) => b.score - a.score);
    const topTen = matches.slice(0, 10);

    return res.json({
      success: true,
      role: 'founder',
      recommendations: topTen,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * For a user with role "investor", find their Investor document by userId,
 * then find all founders and compute match scores.
 */
async function getInvestorRecommendationsByUserId(req, res) {
  try {
    // 1. Find the investor document by userId
    const investor = await Investor.findOne({ userId: req.user.id });
    if (!investor) {
      return res.status(404).json({
        success: false,
        message: 'No investor profile found for this user',
      });
    }

    // 2. Find all founders
    const founders = await Founder.find({});

    // 3. Compute match scores
    const matches = founders.map((founder) => ({
      founder,
      score: computeMatchScore(founder, investor),
    }));

    // 4. Sort by descending score
    matches.sort((a, b) => b.score - a.score);
    const topTen = matches.slice(0, 10);

    return res.json({
      success: true,
      role: 'investor',
      recommendations: topTen,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/*
 * For a user with role "enthusiast" (or any other role),
 * right now it returns ordering by the startups which have higher user base 
 * for future it will do a 
 */
async function getGeneralRecommendations(req, res) {
  try {
    const popularStartups = await Founder.find({})
      .sort({ 'traction.userBase': -1 })
      .limit(10);

    return res.json({
      success: true,
      role: 'general',
      popularStartups,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getFounderRecommendationsByUserId,
  getInvestorRecommendationsByUserId,
  getGeneralRecommendations,
};
