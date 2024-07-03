const express = require('express');
const mysql = require('mysql');
require('dotenv').config();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Dun API v2! I\'m presuming you shouldn\'t have access... :)');
});

app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM dun_users';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/user/:id', (req, res) => {
  const {id} = req.params;
  const sql = `SELECT * FROM dun_users WHERE id = '${id}'`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0].username);
  });
});

app.post('/users/register', (req, res) => {
    const {email, username, password} = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const sql = 'INSERT INTO dun_users (email, username, password) VALUES (?, ?, ?)';
        db.query(sql, [email, username, hash], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
