const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Endpoint to list JSON files in topics/data directory
app.get('/topics/data/', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'src', 'topics', 'data');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  } catch (error) {
    console.error('Error reading topics directory:', error);
    res.status(500).json({ error: 'Failed to read topics directory' });
  }
});

// Endpoint to serve individual topic JSON files
app.get('/topics/data/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'src', 'topics', 'data', req.params.filename);
    const fileContent = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } catch (error) {
    console.error(`Error reading topic file ${req.params.filename}:`, error);
    res.status(500).json({ error: `Failed to read topic file ${req.params.filename}` });
  }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
