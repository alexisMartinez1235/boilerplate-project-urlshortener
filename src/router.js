const express = require('express');
const shorturl = require('./shorturl');

const router = express.Router();

// db conection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Successfully connected!' });
});

// Your first API endpoint
router.get('/hello', (req, res) => {
  res.status(200).json({ greeting: 'hello API' });
});

// CRUM URL and save response in req.app.locals.url
router.use('/shorturl', shorturl);
 

module.exports = router;