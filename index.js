'use strict';

var action = require('./mailer.js');

exports.handler = function(event, context, callback) {
  action.run(event, context, function(error, result) {
context.callbackWaitsForEmptyEventLoop = false;
    return callback(error, result); 
  });
};
