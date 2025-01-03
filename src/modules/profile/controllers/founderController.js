const { Founder } = require("../models/founderModel");
const { User } = require("../../auth/models/userModel");
const { validateUserCredentials } = require("../../../utils/validations");

const registerfounder = async (req, res, next) => {
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
      role: "Founder",
    });

    const newFounder = await Founder.create({
      userId: user._id,
    });

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, options).json({
      success: true,
      message: "Founder registered successfully",
      token: token,
      founderDetails: {
        user,
        newFounder,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginFounder = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(500).json({
        success: false,
        message: "Please provide a email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User doesnot exist",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: "password entered is incorrect",
      });
    }

    const founder = await Founder.findOne({ userId: user._id });

    if (!founder) {
      res.status(401).json({
        success: false,
        message: "No founder found associated with this email",
      });
    }
    const token = await user.generateToken();
    //save the token to  the cookie or the local storage

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "Founder logged in successfully",
      token,
      founderDetails: {
        user,
        founder,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
  // console.log("user logged in");
};

const logoutFounder = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
    res.clearCookie("token");
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

//used to follow the user and if already followed, unfollow the user
const followUser = async (req, res, next) => {
  //find user that needs to be followed
  const userToFollow = await User.findById(req.params.id);
  // find user that is following the user
  const loggedInUser = await User.findById(req.user._id);

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  //unfollow condition
  if (loggedInUser.following.includes(userToFollow._id)) {
    const userToFollowIndexInFollowingList = loggedInUser.following.indexOf(
      userToFollow._id
    );
    const loggedInUserIndexInFollowersList = userToFollow.followers.indexOf(
      loggedInUser._id
    );

    userToFollow.followers.splice(loggedInUserIndexInFollowersList, 1);
    loggedInUser.following.splice(userToFollowIndexInFollowingList, 1);

    await userToFollow.save();
    await loggedInUser.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed",
    });
  } else {
    //follow condition
    userToFollow.followers.push(loggedInUser._id);
    loggedInUser.following.push(userToFollow._id);

    await userToFollow.save();
    await loggedInUser.save();

    res.status(200).json({
      success: true,
      message: "User followed",
    });
  }
};

module.exports = { registerfounder, loginFounder, logoutFounder, followUser };
