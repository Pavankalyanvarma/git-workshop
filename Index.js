const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cron = require('cron');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Secret key for JWT
const secretKey = 'pkv';

// Simulated user database
const users = [];

// Create user API
app.post('/create-user', (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
  } else {
    const newUser = { username, password };
    users.push(newUser);
    res.status(201).json({ message: 'User created successfully' });
  }
});

// Login user API
app.post('/login-user', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and the password is correct
  const user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Validate user middleware
const validateUser = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  jwt.verify(token.replace('Bearer ', ''), secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Token is not valid' });
    } else {
      req.username = decoded.username;
      next();
    }
  });
};

// Protected endpoint
app.get('/protected-user', validateUser, (req, res) => {
  res.json({ message: 'You have access to this protected endpoint', user: req.username });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Create a cron job (for example, runs every minute)
const cronJob = new cron.CronJob('* 1 * * *', function () {
  // Perform some cron job tasks here
  console.log('Cron job executed');
});
cronJob.start();
