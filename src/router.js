const dns = require('node:dns');
const express = require('express');
const router = express.Router();
const {
  Url,
  UrlSchema
} = require('./model/Url');

// db conection

const mongoose = require('mongoose');
const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


function validateURL(req, res, next) {
  const { url } = req.body;
  const options = {
    family: 4,
    // hints: dns.ADDRCONFIG | dns.V4MAPPED,
    all: true
  };
  try {
    req.app.locals.original_url = new URL(url, "https://example.com");
  } catch(err) {    
    return res.status(400).json({
      error: 'invalid url'  
    });
  }
  
  const { original_url } = req.app.locals;
  
  // console.log(original_url);
  
  // console.log(`url:${original_url}`);

  dns.lookup(original_url.hostname,
    options, (err, addresses) => {
      if (err || addresses === []) return res.status(400).json({
        error: 'invalid url',
        message: err,
      });
      // console.log('addresses: %j', addresses);
      return next();
    });
}

function sendResponse(req, res, next) {
  const { url } = req.app.locals;
  const { short_url, original_url } = req.app.locals.url;
           
  res.status(200).json({ short_url, original_url });
}

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Successfully connected!' });
});

// Your first API endpoint
router.get('/hello', (req, res) => {
  res.status(200).json({ greeting: 'hello API' });
});

// CRUM URL and save response in req.app.locals.url

router.get('/shorturl/:short_url?', (req, res, next) => {
  const { short_url } = req.params;
    
  console.log(`short_url: ${short_url}`);
  
  Url.findOne({ short_url }, (err, url) => {
    if (err) return res.status(500).json({
      err, id:'/shorturl-1-get'
    });
    if (url === null) {
      return res.status(500).json({
        err: 'invalid short url'
      });
    }
    req.app.locals.url = url;
    return res.status(200).redirect(url.original_url);
  });
}, sendResponse);

router.post('/shorturl', validateURL, (req, res, next) => {
  const { original_url } = req.app.locals;
  
  Url.findOne({ original_url }, (errFindIfExists, urlAlreadyExists) => {
    
    if (errFindIfExists) return res.status(500).json({
      err: errFindIfExists,
      id:'/shorturl-1-post'
    });
    if (urlAlreadyExists) {
      req.app.locals.url = urlAlreadyExists;
      return next();
    }
    
    Url.findOne()
      .sort({
        short_url: -1
      })
      .limit(1)
      .select('-original_url')
      .exec((errFindLastId, urlLastId) => {
        let lastUrlId = 0;
        if (errFindLastId) return res.status(500).json({
          err: errFindLastId,
          id:'/shorturl-2-post'
        });
        if (urlLastId) lastUrlId = urlLastId.short_url;
                
        Url.create({
          short_url: lastUrlId + 1,
          original_url,
        }, (errCreate, urlCreated) => {
          if (errCreate) return res.status(500).json({
            err: errCreate,
            id:'/shorturl-3-post'
          });
          if (urlCreated)  {
            req.app.locals.url = urlCreated;
            return next();
          }
        });
      });
    });
}, sendResponse);

module.exports = router;