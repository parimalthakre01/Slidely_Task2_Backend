import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;
const dbFilePath = path.join(__dirname, 'db.json');

interface Submission {
  Name: string;
  Email: string;
  PhoneNumber: string;
  GitHubLink: string;
  StopwatchTime: string;
}

interface Database {
  submissions: Submission[];
}

app.use(bodyParser.json());

// Endpoint to check if the server is running
app.get('/ping', (req, res) => {
  res.json({ success: true });
});

// Endpoint to submit form data
app.post('/submit', (req, res) => {
    console.log(req.body)
  const { Name, Email, PhoneNumber, GitHubLink, StopwatchTime } = req.body;

  const newSubmission: Submission = { Name, Email, PhoneNumber, GitHubLink, StopwatchTime };

  // Read the current database file
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading database file' });
    }

    let db: Database;
    try {
      db = JSON.parse(data);
    } catch (err) {
      db = { submissions: [] };
    }

    db.submissions.push(newSubmission);

    // Write the updated data back to the file
    fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error writing to database file' });
      }

      res.json({ success: true, message: 'Submission saved' });
    });
  });
});

// Endpoint to read submissions
app.get('/read', (req, res) => {
  const index = req.query.index ? parseInt(req.query.index as string) : null;

  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading database file' });
    }

    let db: Database;
    try {
      db = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ error: 'Error parsing database file' });
    }

    if (index !== null && !isNaN(index)) {
      if (index < 0 || index >= db.submissions.length) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      return res.json(db.submissions[index]);
    }

    res.json(db.submissions);
  });
});

// Initialize the database file if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({ submissions: [] }, null, 2));
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
