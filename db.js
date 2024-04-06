const mongoose = require("mongoose");

try {
  mongoose.connect("mongodb://127.0.0.1:27017/insta");
  console.log("MongoDB connection succeded");
} catch (error) {
  handleError(error);
}

function handleError(err) {
  if (!err) {
    console.log("MongoDB connection succeded");
  } else {
    console.log("Error in db connection: " + JSON.stringify(err, undefined, 2));
  }
}

module.exports = mongoose;
