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
  "Verizon": "@vtext.com"
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

  /* We will not be using Edmunds api for now(not necessary)
   *
  if (carInfo !== null) {
    var decodeVin = new decoder.decodeVin(parameters.vinNumber);    
    decodeVin.on('carDetails', function() {
      if (decodeVin.error === false) {
        carSpecs = decodeVin.data;
        year = carSpecs.years[0].year;
        make = carSpecs.make.name;
        model = carSpecs.model.name;
        trim = carSpecs.years[0].styles[0].trim;

        mailOptions.text = "Your " + year + ' ' + make + ' ' + model + ' ' + 
                            trim + "has entered the building at lane 1 at " +
                            carInfo.First_seen_time + 'and tagID: ' + 
                            parameters.tagID ; 
      } else {
        mailOptions.text = 'The car you are interested in has entered the' +
                           'building at lane 1 at ' + carInfo.First_seen_time;
      }

      transport.sendMail(mailOptions, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: ", mailOptions.text);
        }
      });
    });
  }*/

  if (carInfo !== null) {
    mailOptions.text = "Your " + parameters.year + ' ' + make + ' ' + model +
                        ' ' + trim + " has entered the building at lane 1 at "+
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
