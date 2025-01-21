const { User } = require("../modules/auth/models/userModel");
const jwt = require("jsonwebtoken");
const {loginErrorMessage} = require("../utils/messages");

const isAuthenticated = async (req, res, next) => {
  try {
    //extract the token from the cookies
    const { token } = req.cookies;
    // console.log(token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: loginErrorMessage,
      });
    }

    const decodedToken = await jwt.verify(token, process.env.SECRET_KEY);

    req.user = { id: decodedToken.id, role: decodedToken.role };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const isRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: loginErrorMessage
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Only ${role}s can access this resource`
      });
    }

    next();
  };
};

module.exports = { 
  isAuthenticated,
  isRole 
};
