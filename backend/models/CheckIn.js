const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  location: {
    type: String,
    enum: ['Remote', 'In Office'],
    required: true,
  }
});

const CheckIn = mongoose.model("CheckIn", checkInSchema);

module.exports = CheckIn;
