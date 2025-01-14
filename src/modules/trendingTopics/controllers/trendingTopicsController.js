import cron from "node-cron";
import { cleanUpTrendingTopics } from "../../../utils/trendingTopicsHelper.js";
import { TrendingTopic } from "../models/trendingTopicsModel.js";

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
export const trending = async (req, res) => {
  try {
    const trending = await TrendingTopic.find()
      .sort({ postCount: -1 })
      .limit(10);

    res.json({
      success: true,
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
