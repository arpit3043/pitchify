const { User } = require("../models/userModel");
const {validateUserCredentials} = require("../../../utils/validations"); 

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }
  
      const user = await User.findOne({ email }).select('+password');
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const isPasswordMatch = await user.matchPassword(password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const token = await user.generateToken();
  
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      };
  
      // Remove password from response
      user.password = undefined;
  
      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Logged in successfully",
        token,
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

const logoutUser = async (req, res) => {
    try {
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not logged in",
        });
      }

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      };

      res.clearCookie("token", options);
      res.status(200).json({
        success: true,
        message: "Founder logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate user input
        const validation = validateUserCredentials({ name, email, password });
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.errors
          });
        }
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
          return res.status(404).json({
            success: false,
            message: "Email already in use for a founder or an investor",
          });
        }
        
        // Create user with validated data
        user = await User.create({
          name,
          email,
          password,
          role : "enthusiast"
        });
        await user.save();

        const token = await user.generateToken();
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        };
        const userResponse = user.toObject();
        delete userResponse.password;
    
        res.status(201).cookie("token", token, options).json({
          success: true,
          message: "User registered successfully",
          token,
          user: userResponse
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}   
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
  module.exports = {loginUser , logoutUser , registerUser , viewUser, followUser, unfollowUser}

  