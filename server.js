const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");

const app = express()
// For local execution
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.listen(port, function () {
  console.log('App listening on port 3000!')
})

// Send the ejs view without any error or result on the first request
app.get('/', function (req, res) {
  res.render('index', {serialized: null, err: null});
})


// Reverse Endianess, as bitcoin wants little endian and the API provides big endian
const reverseEndianess = (hexString => {
  const inversed = [];
  let i = hexString.length - 2;
  while (i >= 0) {
    inversed.push(hexString.substr(i, 2));
    i -= 2;
  }
  return inversed.join('');
})

const serialize = (data => {
  const versionHex = reverseEndianess(data['version'].toString(16));
  const prevBlockHash = reverseEndianess(data['prev_block_hash']);
  const mRoot = reverseEndianess(data['mrkl_root']);
  const time = reverseEndianess(data['timestamp'].toString(16));
  const bits = reverseEndianess(data['bits'].toString(16));
  const nonce = reverseEndianess(data['nonce'].toString(16));

  return versionHex + prevBlockHash + mRoot + time + bits + nonce;
})

app.post('/', function (req, res) {
  // Get the block info that was requested using btc api
  const blockNum = req.body.blockNum;
  const btcApiUrl = `https://chain.api.btc.com/v3/block/${blockNum}`;
  request.get(btcApiUrl, function(err, response, body){
    // Simple error handling
    if(err || response.statusCode != 200){
      res.render('index', {serialized: null, err: 'API error while fetching your block, please try again'});
    }
    // Send back the serialized header of the block requested
    else {
      const bodyParsed = JSON.parse(body);
      res.render('index', {serialized: serialize(bodyParsed['data']), err: null});
    }
  })
})
