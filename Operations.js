const express = require('express');
const port = 8000;
const db = require('./mongoose');
const app = express();

app.use(express.urlencoded());
app.use(express.json());
const User = require('./schema');

// Create a POST endpoint for creating a new user
app.post('/user', async (req, res) => {
    try {
      const { name, email } = req.body;
  
      // Check if a user with the same name or email already exists
      const existingUser = await User.findOne({ $or: [{ name }, { email }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User with the same name or email already exists' });
      }
  
      const newUser = await User.create(req.body);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Create a GET endpoint for searching, sorting, pagination, and selection
app.get('/users', async (req, res) => {
  try {
    const { skip, limit, selectionKeys, search, sortKey } = req.query;

    const query = {};

    // Include selectionKeys
    if (selectionKeys) {
      const projection = selectionKeys.split(',').reduce((acc, key) => {
        acc[key] = 1;
        return acc;
      }, {});
      query['$project'] = projection;
    }

    // Include search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query['$match'] = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      };
    }

    // Sort
    if (sortKey) {
      query['$sort'] = {};
      query['$sort'][sortKey] = 1; // 1 for ascending, -1 for descending
    }

    // Perform the aggregation
    const aggregation = [
      { $skip: parseInt(skip) || 0 },
      { $limit: parseInt(limit) || 10 },
      query,
    ];

    const users = await User.aggregate(aggregation).exec();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log('Server started on port', port);
});
