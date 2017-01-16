'use strict';

var path          = require('path'),
    Promise       = require('bluebird'),
    nodemailer    = require('nodemailer'),
    EmailTemplate = require('email-templates').EmailTemplate;

module.exports.run = function(event, context, cb) {
  if (!process.env.EMAIL_SERVICE) {
    return cb(new Error('EMAIL_SERVICE env var not set'));
  }

  if (!process.env.EMAIL_SERVICE_USER) {
    return cb(new Error('EMAIL_SERVICE_USER env var not set'));
  }

  if (!process.env.EMAIL_SERVICE_PASS) {
    return cb(new Error('EMAIL_SERVICE_PASS env var not set'));
  }

  var templateDir = path.join(__dirname, 'templates', event.language);
  var template = new EmailTemplate(templateDir);

  Promise.promisifyAll(template);

  var sendMail = function(result) {
    var transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS
      }
    });

    Promise.promisifyAll(transporter);

    event.text = result.text;
    event.html = result.html;
    event.to = event.userEmail;
    event.from = event.dealerEmail;

    //var mailOptions = event;

    /*{
    from: "Fred Foo ✔ <foo@blurdybloop.com>", // sender address
    to: "malavikam@realityi.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world ✔", // plaintext body
    html: "<b>Hello world ✔</b>" // html body
}
*/
    //return transporter.sendMailAsync(mailOptions);
    return transporter.sendMailAsync(event);
  };

  var handleResponse = function(info) {
    console.log('Callback Message sent: ' + info.response);
    return cb(null,'Yaay callback success');
  };

  template.render(event)
    .then(sendMail)
    .then(handleResponse)
    .catch(function(e) {
      return cb(new Error('Something went wrong!'));
    });
};
