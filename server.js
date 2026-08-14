const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve your existing frontend files
app.use(express.static(path.join(__dirname)));

app.get('/api/test', (req, res) => {
  res.send('Backend is connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));