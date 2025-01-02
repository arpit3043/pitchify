const { Investor } = require("../models/investorModel");
const { User } = require("../modules/user/userModel");

const registerInvestor = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(404).json({
        success: false,
        message: "Email already in use as an investor or a founder",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      role: "Investor",
    });

    const newInvestor = await Investor.create({
      userId: user._id,
    });
    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "investor registered successfully",
      token: token,
      investorDetails: {
        user,
        newInvestor,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  //   console.log("user registered successfully");
};

const loginInvestor = async (req, res, next) => {
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
        message: "investor doesnot exist",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: "password entered is incorrect",
      });
    }

    const investor = await Investor.findOne({
      userId: user._id,
    });

    if (!investor) {
      res.status(401).json({
        success: false,
        message: "No investor found associated with this email",
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
      message: "investor logged in successfully",
      token,
      investorDetails: {
        user,
        investor,
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

const logoutInvestor = async (req, res, next) => {
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
      message: "investor logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { registerInvestor, loginInvestor, logoutInvestor };
