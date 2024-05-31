const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User", // Reference to the User model
    required: true,
  },
  date: {
    type: String,
    default: Date.now,
    required: true,
  },
  location: {
    type: String,
    enum: ['Remote', 'In Office'],
    required: true,
  }
});

module.exports = mongoose.model("CheckIn", checkInSchema);
