const {
  TrendingTopic,
} = require("../modules/trendingTopics/models/trendingTopicsModel.js");

const extractHashtags = (content) => {
  const hashtags = content.match(/#\b[a-zA-Z0-9_]{2,}\b/g) || [];
  return [...new Set(hashtags.map((tag) => tag.toLowerCase()))];
};

const updateTrendingTopics = async (hashtag, postId) => {
  try {
    // Check if the hashtag is already in the trending collection
    let trending = await TrendingTopic.findOne({ hashtag });

    if (trending) {
      // Update existing trending topic
      await TrendingTopic.updateOne(
        { hashtag },
        {
          $inc: { postCount: 1 },
          $addToSet: { postIds: { postId, createdAt: new Date() } },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // Create new trending topic
      const newTrendingTopic = new TrendingTopic({
        hashtag,
        postCount: 1,
        postIds: [{ postId, createdAt: new Date() }],
      });
      await newTrendingTopic.save();
    }
  } catch (error) {
    console.error("Error updating trending topics:", error);
  }
};

const handlePostDeletion = async (postId, hashtags) => {
  for (const hashtag of hashtags) {
    // Remove the specific postId entry
    await TrendingTopic.updateOne(
      { hashtag },
      {
        $pull: { postIds: { postId } },
        $inc: { postCount: -1 },
      }
    );

    // Remove the hashtag if its post count is zero
    const trending = await TrendingTopic.findOne({ hashtag });
    if (trending && trending.postCount <= 0) {
      await TrendingTopic.deleteOne({ hashtag });
    }
  }
};

const handlePostUpdate = async (postId, oldHashtags, newHashtags) => {
  // Remove old hashtags
  await handlePostDeletion(postId, oldHashtags);

  // Add new hashtags
  for (const hashtag of newHashtags) {
    await updateTrendingTopics(hashtag, postId);
  }
};

const cleanUpTrendingTopics = async () => {
  try {
    // Calculate timestamp for 3 days ago
    // if you want to check add 60 * 1000 to remove after 1 hour
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Find and update trending topics
    const trendingTopics = await TrendingTopic.find();
    for (const topic of trendingTopics) {
      // Filter out posts older than 3 days
      topic.postIds = topic.postIds.filter(
        (post) => post.createdAt > threeDaysAgo
      );

      // Update post count based on the filtered postIds array
      topic.postCount = topic.postIds.length;

      // If no posts remain for this hashtag, delete the trending topic
      if (topic.postCount === 0) {
        await topic.deleteOne();
      } else {
        await topic.save();
      }
    }

    console.log("Trending topics cleaned up successfully");
  } catch (error) {
    console.error("Error during trending topics cleanup:", error.message);
  }
};

module.exports = {
  extractHashtags,
  updateTrendingTopics,
  handlePostDeletion,
  handlePostUpdate,
  cleanUpTrendingTopics,
};
