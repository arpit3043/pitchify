const { User } = require("../modules/auth/models/userModel");
const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try {
    //extract the token from the cookies
    next()
    const { token } = req.cookies;
    console.log(token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const decodedToken = await jwt.verify(token, process.env.SECRET_KEY);

    console.log(decodedToken);

    req.user = await User.findById(decodedToken.id);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { isAuthenticated };
