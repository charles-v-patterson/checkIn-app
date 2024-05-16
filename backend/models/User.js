const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9.]+@(?:[a-zA-Z.]{3})?ibm\.com$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validateEmail,
      message: 'Please fill a valid IBM email address',
    },
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  manager: String,
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
