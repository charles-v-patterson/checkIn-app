const express = require("express");
const session = require('express-session')
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const CheckIn = require("./models/CheckIn");
const User = require("./models/User");
const moment = require("moment");
const cron = require("node-cron");
const startScheduler = require("./jobScheduler");
const passport = require('passport');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const startNotificationScheduler = require("./jobScheduler");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Configure Environment Variables
dotenv.config();

// Express App Initialization
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON payloads

const w3callbackUrl = `https://localhost:${port}/oidc_callback`
const discoveryURL = process.env.W3_LOGIN_URL;
const clientID = process.env.W3_CLIENT_ID;
const clientSecret = process.env.W3_CLIENT_SECRET

const OpenIDConnectStrategy = require('passport-ci-oidc').IDaaSOIDCStrategy
const Strategy = new OpenIDConnectStrategy({
  discoveryURL : discoveryURL,
  clientID : clientID,
  scope : 'openid',
  response_type : 'code',
  clientSecret : clientSecret,
  callbackURL : w3callbackUrl,
  skipUserProfile : true,
  passReqToCallback : true
}, (req, iss, sub, profile, done) => {
  // 'profile' is what w3ID returned to us and has lots of info in it

  // The object we pass to the 'done() callback is stored as 'req.user' and accessible
  // in express route handlers. A real app would probably pass a full user-like object
  // here instead of just a single string.
  done(null, profile)
})

passport.use('openidconnect', Strategy)

// These should be updated to take in the full user object and turn
// it into a single unique identifier for the cookie state, and to
// do the reverse. This implementation will depend on how you store
// users; if they are in a database, for example, then the serialize
// function can return the user's unique identifier, and the deserialize
// function can take that identifier and look the user up in the database
// and restore the user object. In this simple example the user object
// is only the ID from above anyhow, so serialize/deserialize are no-ops,
// and we have no database keeping track of other information about the
// user.
passport.serializeUser(function(user, done) { done(null, user) })
passport.deserializeUser(function(id, done) { done(null, id) })

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize())
app.use(passport.session())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const createLongToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3h" });
};

// API Routes
app.post("/api/verifyJWT", authRoutes);
app.post("/api/register", authRoutes);
app.post("/api/remove", authRoutes);
app.post("/api/checkin", checkinRoutes);
app.get("/api/check-network", checkinRoutes);
app.post("/api/reports", reportRoutes);
app.post("/api/getEmployees", authRoutes);
app.post("/api/toggleNotifications", authRoutes);
app.post("/api/getNotificationsEnabled", authRoutes);
app.post("/api/getUserByUID", authRoutes);

app.get('/api/check_logged_into_w3', (req, res) => {
  try {
    if (req.isAuthenticated() && User.findOne({ email: new RegExp(req.user.id, "i") })) {
      response = createLongToken({ isAuthenticated: true, user: req.user });
      res.status(200).json(response);
    } else {
      response = createLongToken({ isAuthenticated: false });
      res.status(200).json(response);
    }
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/failure', (req, res) => res.send('login failed'))
app.get('/login', passport.authenticate('openidconnect', {}))

app.get('/oidc_callback', (req,res,next) => {
  passport.authenticate('openidconnect', {
    successRedirect: 'https://localhost:3000/checkin',
    failureRedirect: '/failure',
  })(req,res,next)
})

app.get("/api/authMiddle", (req, res, next) => {
  User.findOne({ email: new RegExp(req.user.id, "i") })
  .then((response) => {
    // change redirect depending on current page
    if (response) {
      res.redirect(`${process.env.FRONTEND_URL}/checkin`);
    }
    else {
      res.redirect(`${process.env.FRONTEND_URL}/401`);
    }
  });
})

app.get("/api/check_if_in_database", (req, res) => {
  try {
    if (req.user.id) {
      const user = User.findOne({ email: new RegExp(req.user.id, "i") })
      if (user) {
        res.json({ inDatabase: true });
      }
      else {
        res.json({ inDatabase: false });
      }
    }
  } catch (err) {
    console.error("User ID is unavailable.");
    try {
      window.location.reload()
    } catch (err) {
      console.error("Window not defined in backend.");
    }
  };
})

const ensureAuthenticated = (req, res, next) => {
  if(!req.isAuthenticated()) {
    res.redirect('/login')
  } else {
    return next()
  }
}

// Whatever object was passed into the OpenIDConnectStrategy's 'done(..., user)'
// callback is what ends up in req.user here.
app.get("/api/w3info", ensureAuthenticated, (req, res) => {
  try {
    let result = req.user;
    res.json(result);
  } catch (error) {
    console.error('Error with w3info api:', error);
    res.status(500).json({ error: 'An error occurred while checking w3info.' });
}
});

// You can use self-signed certificates for testing, or real certificates for
// testing and production.
const httpsServer = https.createServer({
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.cert'),
}, app);

// Start Server
httpsServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});