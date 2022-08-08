const mongoose = require('mongoose');
const mongo_uri = process.env['MONGO_URI'];

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UrlSchema = new mongoose.Schema({
  short_url: {
    type: Number,
    unique: true,
    required: true
  },
  original_url: {
    type: String,
    required: true
  },
});

const Url = mongoose.model('URL', UrlSchema, 'URL');

module.exports = {
  Url,
  UrlSchema
};
