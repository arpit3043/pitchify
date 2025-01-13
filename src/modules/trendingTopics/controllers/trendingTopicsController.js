import { TrendingTopic } from "../models/trendingTopicsModel.js";

// Define the /trending route
export const trending = async (req, res) => {
  const trending = await TrendingTopic.find().sort({ postCount: -1 }).limit(10);

  res.json(trending);
};

// module.exports = { trending };
