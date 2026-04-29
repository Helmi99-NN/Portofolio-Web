const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'helmi_portfolio_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from root (for the main website)
app.use(express.static(path.join(__dirname, '/')));

// Serve admin files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Helper to read data
const getData = () => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    const file = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(file);
  } catch (err) {
    return { experiences: [], organizations: [], certifications: [], contents: [] };
  }
};

// Helper to write data
const saveData = (data) => {
  const dataPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// --- API Endpoints ---

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded credentials for simplicity
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '2h' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Check auth status
app.get('/api/check-auth', authenticateJWT, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

// Get all data (Public)
app.get('/api/data', (req, res) => {
  res.json(getData());
});

// Save all data (Protected)
app.post('/api/data', authenticateJWT, (req, res) => {
  const newData = req.body;
  saveData(newData);
  res.json({ success: true, message: 'Data saved successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
