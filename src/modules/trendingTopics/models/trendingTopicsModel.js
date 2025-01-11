const mongoose = require("mongoose");
const trendingSchema = new mongoose.Schema(
  {
    hashtag: { type: String, required: true, unique: true },
    postCount: { type: Number, default: 0 },
    postIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  },
  { timeseries: true }
);

trendingSchema.index({ hashtag: 1 });
const TrendingTopic = mongoose.model("TrendingTopic", trendingSchema);

module.exports = { TrendingTopic };
