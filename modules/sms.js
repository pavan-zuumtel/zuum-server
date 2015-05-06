var nodemailer = require('nodemailer');
var decoder = require('../apis/edmunds/decoder.js');

/*
 * Configure smtp server details
 */
var transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "zuum.email@gmail.com",
    pass: "zuum.tel"
  }
});

// TODO: Include the gateway addresses of all known mobile carriers if
// using this method to send SMS.
var carrierSMTPFormat = {
  "AT&T": "@txt.att.net",
  "Sprint": "@pm.sprint.com",
  "T-mobile": "@tmomail.net",
  "Verizon": "@vzwpix.com"
};

var mailOptions = {
  from: "lanealert@zuumtel.com",
  to: "",
  // subject: "",
  text: ""
};

var sendSMS = function(snapshot, parameters) {
  mailOptions.to = parameters.mobileNumber.trim() + 
                   carrierSMTPFormat[parameters.carrier].trim();
  var carInfo = snapshot.val();

  var year = parameters.year;
  var make = parameters.make;
  var model = parameters.model;
  var trim = parameters.trim;
  var lane = parameters.lane;
  var run = parameters.run;
  var vin = parameters.vinNumber;

  var name = year + ' ' + make + ' ' + model + ' ' + trim + ': \n';

  if (carInfo !== null) {
    // mailOptions.subject = year + ' ' + make + ' ' + model + ' ' + trim;
    mailOptions.text = name + 'This vehicle has entered Lane ' + lane + '/Run '+
                        run + ' at ' + carInfo.First_seen_time + '. VIN: ' +
                        vin;

    transport.sendMail(mailOptions, function(error, response) {
      if(error) {
        console.log(error);
      } else {
        console.log("Message sent: ", mailOptions.text);
      }
    }); 
  }
};

var sendStatusSMS = function(message, mobileNumber, carrier_name) {
  mailOptions.to = mobileNumber + carrierSMTPFormat[carrier_name];
  mailOptions.text = message.text;

  transport.sendMail(mailOptions, function(error, response) {
    if(error)
      console.log(error);
    else
      console.log("StatusSMS sent:", message.text);
  });

};

exports.sendSMS = sendSMS;
exports.sendStatusSMS = sendStatusSMS;
