require('dotenv').config();
const express = require('express');
const router = require('./src/router');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
