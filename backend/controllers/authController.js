const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Helper function to create JWTs
const createLongToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3h" });
};

const createShortToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 300 });
};

exports.register = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { uid, email, name, manager } = req.body;

    const emailregex = /^[a-zA-Z0-9.-]+@(?:[a-zA-Z.]{3})?ibm\.com$/;

    const emailMatch = emailregex.test(email);

    if (!emailMatch) {
      return res.status(400).json({ error: "Email does not meet requirements" });
      
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const newUser = manager ? new User({uid, email, name, manager}) : new User({uid, email, name});
    
    await newUser.save();

    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // 1. Destructure email and password from request body
    const { authemail, email }  = req.body;

    const emailregex = /^[a-zA-Z0-9.-]+@(?:[a-zA-Z.]{3})?ibm\.com$/;

    const emailMatch = emailregex.test(email) && emailregex.test(authemail);

    if (!emailMatch) {
      return res.status(400).json({ error: "One or both emails does not meet requirements" });
    }

    // 2. Check if user exists

    const response = await fetch(new Request("https://localhost:5000/api/getEmployees", 
                                          {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" }, 
                                            body: JSON.stringify({email: authemail}),
                                          }
                                        ));
    
    const data = await response.json();

    if (data.employees.includes(email)) {
      await User.deleteOne({email: email});
    }
    else {
      return res.status(401).json({ error: "Not authorized to delete this user" });
    }

    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleNotifications = async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if (user) {
      await User.updateOne({email: user.email}, {notification: !user.notification});
      res.sendStatus(201);
    }
    else {
      res.status(400).json({ error: "User Not Found" });
    }
    
  }
  catch {
    res.status(500).json({ error: error.message });
  }
}

exports.sendEmail = async (req, res) => {
  const { email, message } = req.body;
  const token = createShortToken(email);
  let content = `<p>${message}</p>`;
  let subject = 'Notification from IBM Punch Card';
  
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
    let decodedJWT;
    jwt.verify(req.body.auth, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        res.status(401);
      }
      else {
        decodedJWT = decoded;
      }
    });
    if (decodedJWT) {
      try {
        const existingUser = await User.findOne({ email: new RegExp(decodedJWT.id, "i") });
        if (existingUser){
          res.status(200).json({ decoded });
        }
        else{
          res.status(401);
        }
      }
      catch {
        res.status(500);
      }
    res.status(500);
  }
};

exports.getNotificationsEnabled = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: new RegExp(email, "i") });
    if (user) {
      res.status(200).json({enabled: user.notification});
    }
    else {
      return res.status(400).json({ error: "Invalid user" });
    }
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

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

exports.getUserByUID = async (req, res) => {
  try {
    const uidformat = new RegExp(/^\d[0-9A-Z]\d{7}$/);
    if (!uidformat.test(req.body.uid)) {
      return res.status(400).json({error: "Invalid UID"});
    }
    const response = await fetch(new Request(`https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=${req.body.uid})/byjson?uid&callupname&mail`));
    const empdata = await response.json();

    let emp = empdata.search.entry[0];
    let uidIndx, nameIndx, mailIndx;
    for (let i = 0; i < emp.attribute.length; i++) {
      switch (emp.attribute[i].name) {
        case "mail": mailIndx = i; break;
        case "callupname": nameIndx = i; break;
        case "uid": uidIndx = i; break;
      }
    }
    let name = emp.attribute[nameIndx].value[0].split(",").reverse().join(" ").substring(1);
    let uid = emp.attribute[uidIndx].value[0];
    let email = emp.attribute[mailIndx].value[0];

    res.status(200).json({name: name, uid: uid, email: email, manager: ""});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
 
}
