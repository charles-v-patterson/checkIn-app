const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to create JWTs
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

exports.register = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password } = req.body;

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // 3. Create new user
    const newUser = new User({
      email,
      password
    });

    await newUser.save();

    // 4. Generate and send JWT
    const token = createToken(newUser._id);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password } = req.body;

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      
      const salt = await bcrypt.genSalt(10);

      // Hash the password using the generated salt
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.updateOne({email: email}, {password: hashedPassword});
    }

    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//"$2y$10$ES9rB18FUUttOARnXnC7aeGUQcTbA5K4uIuMAB4bFrNK9/gCIENci"

exports.login = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password } = req.body;

    // 2. Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password or password" });
    }

    // 4. Generate and send JWT
    const token = createToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basic function to check token validity
exports.checkToken = async (req, res) => {
  res.status(200).json({ message: "Token is valid" });
};
