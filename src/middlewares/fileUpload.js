const { upload } = require('../utils/uploadConfig');

const handleFileUpload = {
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  },

  array: (fieldName, maxCount) => {
    return (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  }
};

module.exports = handleFileUpload;