const { mongoose } = require("mongoose");
const { User } = require("../../auth/models/userModel");

// View user profile
const viewUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an user ID" });
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      const isUserExist = await User.findById(id);
      if (!isUserExist) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Follow User
const followUser = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { id } = req.params;
    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a user ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (loggedInUser._id.equals(id)) {
      return res.status(400).json({
        success: false,
        message: "You Could not follow yourself",
      });
    }

    const isFollowing = loggedInUser.following.some((userId) =>
      userId.equals(id)
    );

    if (isFollowing) {
      return res.status(400).json({
        success: false,
        message: `You are already Following ${
          targetUser.name[0].toUpperCase() + targetUser.name.slice(1)
        }`,
      });
    }
    loggedInUser.following.unshift(id);
    targetUser.followers.unshift(loggedInUser._id);
    await loggedInUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `You are Following ${
        targetUser.name[0].toUpperCase() + targetUser.name.slice(1)
      }`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { id } = req.params;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a user ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (loggedInUser._id.equals(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself.",
      });
    }

    const isFollowing = loggedInUser.following.some((userId) =>
      userId.equals(id)
    );
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: `You are not following ${targetUser.name}.`,
      });
    }

    loggedInUser.following = loggedInUser.following.filter(
      (userId) => !userId.equals(id)
    );

    targetUser.followers = targetUser.followers.filter(
      (userId) => !userId.equals(loggedInUser._id)
    );

    await loggedInUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.name}.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while trying to unfollow the user.",
      error: err.message,
    });
  }
};

module.exports = { viewUser, followUser, unfollowUser };
