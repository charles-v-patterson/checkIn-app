const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Helper function to create JWTs
const createLongToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3h" });
};

const createShortToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 600 });
};

exports.register = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password, name, manager } = req.body;

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

    const newUser = manager ? new User({email, password, name, manager}) : new User({email, password,  name});
    
    await newUser.save();

    // 4. Generate and send JWT
    const token = createShortToken(newUser._id);
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
    const existingUser = await User.findOne({ email: new RegExp(email, "i") });
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
  const { email, message } = req.body;
  const token = createShortToken(email);
  let content;
  let subject;
  if (!message) {
    content = `<h2>Reset Your Password</h2>
               <p> A request was made to reset the password for your account. Click the button below or navigate to the link to reset it. This request will expire in 15 minutes</p>
               <a href=http://localhost:3000/passwordreset/${token} class="button">
                   Reset Password
               </a>
               <p> If the button is not working, paste this link into your browser: </p>
               <p> http://localhost:3000/passwordreset/${token} </p>
               <p>If you did not request a password reset, please ignore this email</p>`;
    subject = 'Password Reset Request';
  }
  else {
    content = `<p>${message}</p>`;
    subject = 'Notification from IBM Punch Card';
  }
  const html = `<head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
                    .email-container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; display: flex; flex-direction: column; align-items: center; word-break: break-word;}
                    .button { background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
                  </style>
                </head>
                <body>
                  <div class="email-container">
                    ${content}
                  </div>
                </body>`

  const transporter = nodemailer.createTransport( {
    host: "nomail.relay.ibm.com", // hostname
    port: 25, // port for secure SMTP
    auth: {
      user: process.env.SERVICE_EMAIL_NAME,
      pass: process.env.SERVICE_EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

  const mailOptions = {
      from: process.env.SERVICE_EMAIL_NAME,
      to: email,
      subject: subject,
      html: html
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          res.status(500).json({ error: error.message });
      } else {
          res.sendStatus(200);
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

exports.getEmployees = async (req, res) => {
  const { email } = req.body;
  try {
    const response =  await User.aggregate([{
      '$match': {
        'email': new RegExp(email, "i")
      }
    },
    {
        '$graphLookup': {
            'from': 'users',
            'startWith': '$email',
            'connectFromField': 'email',
            'connectToField': 'manager',
            'as': 'employees'
      }
    }]);
    const employees = response[0].employees.map(employee => employee.email);
    const numemployees = employees.length;
    res.status(200).json({ employees: employees, numemployees: numemployees });
  } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { email, password } = req.body;

    // 2. Find user by email
    const user = await User.findOne({ email: new RegExp(email, "i") });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 4. Generate and send JWT
    const token = createShortToken(user.email);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basic function to check token validity
exports.checkToken = async (req, res) => {
  res.status(200).json({ validToken: true });
};
