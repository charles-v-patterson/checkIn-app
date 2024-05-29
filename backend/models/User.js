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
  password: {
    type: String,
    required: true,
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
  }
});

// Hash password before saving (pre-save hook)
userSchema.pre("save", async function (next) {
  try {
    // Generate salt for stronger hashing
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace the plain-text password with the hashed version
    this.password = hashedPassword;

    // Continue with saving the user
    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware or error handler
  }
});

module.exports = mongoose.model("User", userSchema);
