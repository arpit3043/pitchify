const mongoose = require("mongoose");

exports.connectToDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ventorodbtest.l1uc3.mongodb.net/`
    );
    console.log(`mongoDB connected ${conn.connection.host}`);
  } catch (err) {
    console.log(`error in connecting to DB: ${err.message}`);
  }
};
