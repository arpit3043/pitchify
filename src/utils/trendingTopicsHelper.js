import { TrendingTopic } from "../modules/trendingTopics/models/trendingTopicsModel.js";

export const extractHashtags = (content) => {
  const hashtags = content.match(/#\b[a-zA-Z0-9_]{2,}\b/g) || [];
  return [...new Set(hashtags.map((tag) => tag.toLowerCase()))];
};

export const updateTrendingTopics = async (hashtag, postId) => {
  try {
    // Check if the hashtag is already in the trending collection
    let trending = await TrendingTopic.findOne({ hashtag });

    if (trending) {
      // Update existing trending topic
      await TrendingTopic.updateOne(
        { hashtag },
        {
          $inc: { postCount: 1 },
          $addToSet: { postIds: postId },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // Create new trending topic
      const newTrendingTopic = new TrendingTopic({
        hashtag,
        postCount: 1,
        postIds: [postId],
      });
      await newTrendingTopic.save();
    }
  } catch (error) {
    console.error("Error updating trending topics:", error);
  }
};

export const handlePostDeletion = async (postId, hashtags) => {
  for (const hashtag of hashtags) {
    await TrendingTopic.updateOne(
      { hashtag },
      {
        $pull: { postIds: postId },
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

export const handlePostUpdate = async (postId, oldHashtags, newHashtags) => {
  // Remove old hashtags
  await handlePostDeletion(postId, oldHashtags);

  // Add new hashtags
  for (const hashtag of newHashtags) {
    await updateTrendingTopics(hashtag, postId);
  }
};
