const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Helper function to create JWTs
const createLongToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3h" });
};

const createShortToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

exports.register = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password } = req.body;

    const emailregex = /^[a-zA-Z0-9.]+@(?:[a-zA-Z.]{3})?ibm\.com$/;
    const passregex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/;

    const passMatch = passregex.test(password);
    const emailMatch = emailregex.test(email);

    if (!emailMatch) {
      res.status(400).json({ error: "Email does not meet requirements" });
    }

    if (!passMatch) {
      res.status(400).json({ error: "Password does not meet requirements" });
    }

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
    const token = createLongToken(newUser._id);
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
      const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/;

      const isMatch = regex.test(password);

      if (!isMatch) {
        res.status(400).json({ error: "Password does not meet requirements" });
      }

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

exports.sendEmail = async (req, res) => {
  const { email } = req.body;
  const token = createShortToken(email);
  const link = `localhost:3000/passwordreset/${token}`
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Example using Gmail
    auth: {
        user: process.env.SERVICE_EMAIL_NAME,
        pass: process.env.SERVICE_EMAIL_PASSWORD
    }
  });

  const mailOptions = {
      from: process.env.SERVICE_EMAIL_NAME,
      to: email,
      subject: 'Test email from Nodemailer',
      text: link
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          res.status(500).json({ error: error.message });
      } else {
          res.status(200).json({ token });
      }
  });
};

exports.verifyJWT = async (req, res) => {
    jwt.verify(req.body.auth, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        res.status(401);
      }
      else {
        res.status(200).json({ decoded });
      }
    });
};

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
    const token = createLongToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basic function to check token validity
exports.checkToken = async (req, res) => {
  res.status(200).json({ message: "Token is valid" });
};
