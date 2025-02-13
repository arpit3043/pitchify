// src/modules/recommendations/recommendations.service.js

const natural = require('natural'); 
// (Optional) For basic text similarity if you want to compare strings
// npm install natural


function computeMatchScore(founder, investor, feedbackScore = 0) {
  let totalScore = 0;

  // 1. Industry Match
  // Weighted heavily because matching industry is usually critical
  if (
    investor.investmentPreferences?.sectors?.includes(founder.industry)
  ) {
    totalScore += 30;
  }

  // 2. Funding Range Match
  if (
    typeof founder.fundingNeeds?.amount === 'number' &&
    typeof investor.investmentPreferences?.minAmount === 'number' &&
    typeof investor.investmentPreferences?.maxAmount === 'number'
  ) {
    const needed = founder.fundingNeeds.amount;
    const { minAmount, maxAmount } = investor.investmentPreferences;
    if (needed >= minAmount && needed <= maxAmount) {
      totalScore += 25;
    } else if (needed < minAmount && needed > minAmount * 0.8) {
      // partial credit if close to min
      totalScore += 10;
    } else if (needed > maxAmount && needed < maxAmount * 1.2) {
      // partial credit if slightly above max
      totalScore += 10;
    }
  }

  // 3. Stage Match
  // If founder.startupStage is "Seed" and investor.preferredInvestmentStages is "Seed" or an array that includes "Seed"
  // -> this means we will need to standardise the type of stages of startup 
  if (
    founder.startupStage &&
    investor.investmentPreferences?.preferredInvestmentStages
  ) {
    // handle if investor’s "preferredInvestmentStages" is a single string or array
    const investorStages = Array.isArray(investor.investmentPreferences.preferredInvestmentStages)
      ? investor.investmentPreferences.preferredInvestmentStages
      : [investor.investmentPreferences.preferredInvestmentStages];

    if (investorStages.includes(founder.startupStage)) {
      totalScore += 20;
    }
  }

  // 4. Geographical Match
  if (
    founder.location &&
    Array.isArray(investor.geographicalFocus) &&
    investor.geographicalFocus.includes(founder.location)
  ) {
    totalScore += 15;
  }

  // 5. Traction
  // Suppose we want to give points for higher userBase or revenue
  // You can define thresholds or scale the points by magnitude
  if (founder.traction?.userBase > 1000) {
    totalScore += 5;
  }
  if (founder.traction?.revenue > 50000) {
    totalScore += 5;
  }

  // 6. Textual Similarity (Optional, more advanced)
  // If you want to compare textual fields like "problemStatement" or "uniqueValueProposition"
  // with investor's "keywordsOfInterest" or "experience"
  // For example, using "natural" library's Cosine Similarity or Jaro-Winkler

  if (founder.businessIdea?.problemStatement && investor.experience) {
    const similarity = natural.JaroWinklerDistance(
      founder.businessIdea.problemStatement.toLowerCase(),
      investor.experience.toLowerCase()
    );
    // similarity ranges from 0 (no match) to 1 (exact match)
    totalScore += Math.floor(similarity * 10); // up to +10 points
  }

  return totalScore;
}

module.exports = {
  computeMatchScore
};
