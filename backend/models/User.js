const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For pw hashing

var validateEmail = (email) => {
  var re = /^[a-zA-Z0-9.-]+@(?:[a-zA-Z.]{3})?ibm\.com$/;
  return re.test(email)
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, 'Please fill a valid IBM email address'],
  },
  uid: {
    type: String, 
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  manager: {
    type: String,
    required: false,
  },
  notification: {
    type: Boolean,
    required: true,
    default: true,
  },
  bench: {
    type: Boolean,
    required: true,
    default: false,
  }
});

module.exports = mongoose.model("User", userSchema);
