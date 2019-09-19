const functions = require('firebase-functions');
const next = require('./server');

exports.next = functions.https.onRequest(next);
