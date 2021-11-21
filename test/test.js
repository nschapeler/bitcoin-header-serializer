var assert = require('assert');
const { callbackify } = require('util');
const { fetchAndSerialize } = require('../server');

let headerBlockPairs = [
    [123456, "010000009500c43a25c624520b5100adf82cb9f9da72fd2447a496bc600b0000000000006cd862370395dedf1da2841ccda0fc489e3039de5f1ccddef0e834991a65600ea6c8cb4db3936a1ae3143991"],
    [1, "010000006fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000982051fd1e4ba744bbbe680e1fee14677ba1a3c3540bf7b1cdb606e857233e0e61bc6649ffff001d01e36299"],
    [684933, "0000ff3f8179e8aaf050308cb008998dfa573178cb12e085eb74060000000000000000007bf92bad427f4c5b6ee52853f54ae73563155b6d1305db8c5ef652974e330588ff39ad60e93c0b173dc66d9f"],
    [-1, null]
]



describe('Server', function() {
    describe('#serialize()', function() {

        // Annoying, but we need to sleep for a bit between tests to avoid getting rejected by API
        this.timeout(10000);
        beforeEach(async() => {
            await new Promise(resolve => setTimeout(resolve, 8000));
            console.log("----------------------");
        });


        it('Testing random block', function(done) {
            [blockNum, expected] = headerBlockPairs[0];
            fetchAndSerialize(blockNum, function(res) {
                assert.equal(res, expected);
                done();
            })
        });
        it('Testing first block', function(done) {
            [blockNum, expected] = headerBlockPairs[1];
            fetchAndSerialize(blockNum, function(res) {
                assert.equal(res, expected);
                done();
            })
        });
        it('Testing recent block', function(done) {
            [blockNum, expected] = headerBlockPairs[2];
            fetchAndSerialize(blockNum, function(res) {
                assert.equal(res, expected);
                done();
            })
        });
        it('Testing invalid block', function(done) {
            [blockNum, expected] = headerBlockPairs[3];
            fetchAndSerialize(blockNum, function(res) {
                assert.equal(res, expected);
                done();
            })
        });

    });
});