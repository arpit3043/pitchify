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
const followUser = async (req, res) => {};

// Unfollow User
const unfollowUser = (req, res) => {};

module.exports = { viewUser, followUser, unfollowUser };
