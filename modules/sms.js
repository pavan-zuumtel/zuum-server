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
  from: "zuum.email@gmail.com",
  to: "",
  subject: "About the car you're interested at the auction",
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

  if (carInfo !== null) {
    mailOptions.text = "Your " + year + ' ' + make + ' ' + model +
                        ' ' + trim + " has entered the building at lane" + 
                       lane + " at "+
                       carInfo.First_seen_time + 'and tagID: ' + 
                       parameters.tagID;

    transport.sendMail(mailOptions, function(error, response) {
      if(error) {
        console.log(error);
      } else {
        console.log("Message sent: ", mailOptions.text);
      }
    }); 
  }
};

exports.sendSMS = sendSMS;
