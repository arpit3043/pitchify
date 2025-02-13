const NodeCache = require("node-cache");
const cron = require("node-cron");
const { cleanUpTrendingTopics } = require("../../../utils/trendingTopicsHelper.js");
const { TrendingTopic } = require("../models/trendingTopicsModel.js");

// Initialize cache with a default TTL (Time to Live) of 1 hour (3600 seconds)
// 1 hour cache expiration
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Schedule the cleanup function to run every hour
// user "* * * * *" to test cleanup code it will run every minute
cron.schedule("0 * * * *", async () => {
  console.log("Running trending topics cleanup task...");
  try {
    await cleanUpTrendingTopics();
    console.log("Trending topics cleanup completed successfully.");
  } catch (error) {
    console.error("Error during trending topics cleanup:", error.message);
  }
});

// Define the /trending route
const trending = async (req, res) => {
  try {
    // Check if the trending data is cached
    const cachedTrending = cache.get("trendingData");

    if (cachedTrending) {
      // If cache exists, return it
      console.log("Serving cached trending topics");
      return res.json({
        success: true,
        trending: cachedTrending,
      });
    }

    // If cache is empty, fetch data from the database
    console.log("Fetching trending topics from DB...");
    const trending = await TrendingTopic.find()
      .sort({ postCount: -1 })
      .limit(10);

    // Store the result in cache
    cache.set("trendingData", trending);

    // Return the data
    res.status(200).json({
      success: true,
      message: "Trending Topics fetched",
      trending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trending topics",
      error: error.message,
    });
  }
};

module.exports = { trending };
