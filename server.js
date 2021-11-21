const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");

const app = express()
    // For local execution
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs')

app.listen(port, function() {
    console.log('App listening on port 3000!')
})

// Send the ejs view without any error or result on the first request
app.get('/', function(req, res) {
    res.render('index', { serialized: null, err: null });
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
    // Need to pad version to 8 hex chars long
    let paddedVersion = ("00000000" + data['version'].toString(16)).substr(-8);
    const versionHex = reverseEndianess(paddedVersion);
    const prevBlockHash = reverseEndianess(data['prev_block_hash']);
    const mRoot = reverseEndianess(data['mrkl_root']);
    const time = reverseEndianess(data['timestamp'].toString(16));
    const bits = reverseEndianess(data['bits'].toString(16));
    const nonce = reverseEndianess(data['nonce'].toString(16));

    return versionHex + prevBlockHash + mRoot + time + bits + nonce;
})

const fetchAndSerialize = ((blockNum, callback) => {
    const btcApiUrl = `https://chain.api.btc.com/v3/block/${blockNum}`;
    request.get(btcApiUrl, function(err, response, body) {
        let bodyParsed;
        // API sometimes responds with code 200 but with message "Please don't overuse API", so handle that case
        try {
            bodyParsed = JSON.parse(body);
        } catch (err) {
            return callback(null);
        }

        // Simple error handling
        if (err || response.statusCode != 200 || bodyParsed['data'] == null) {
            return callback(null);
        }
        // Send back the serialized header of the block requested
        else {
            return callback(serialize(bodyParsed['data']));
        }
    })

})

app.post('/', function(req, res) {
    // Get the block info that was requested using btc api
    const blockNum = req.body.blockNum;
    fetchAndSerialize(blockNum, function(serializedBlock) {
        if (serializedBlock === null) {
            res.render('index', { serialized: null, err: 'API error while fetching your block, please try again' });
        } else {
            res.render('index', { serialized: serializedBlock, err: null });
        }

    })
})

module.exports.fetchAndSerialize = fetchAndSerialize;