const { aes256gcm } = require('./secret');
const readline = require('readline');
var Writable = require('stream').Writable;

const cipher = aes256gcm(Buffer.alloc(32));

var mutableStdout = new Writable({
    write: function(chunk, encoding, callback) {
        if (!this.muted) {
            process.stdout.write(chunk, encoding);
        }
        callback();
    }
});

mutableStdout.muted = false;

var input = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
});

input.question('Password: ', function(password) {
    console.log('\nSecret: ' + cipher.encrypt(password));
    console.log('\nDecrypt: ' + cipher.decrypt(cipher.encrypt(password)));
    input.close();
});

mutableStdout.muted = true;
