var express = require('express');
var bodyParser = require('body-parser');
var Firebase = require('firebase');
var nodemailer = require('nodemailer');

var app = express();
var myFirebaseRef = new Firebase("https://flickering-heat-3988.firebaseio.com/");
var auctionSite;	// Associate the mac_address of the reader at a place
/* 
   Configure smtp server details
*/
var transport = nodemailer.createTransport( {
	service: "Gmail",
	auth: {
		user: "zuum.email@gmail.com",
		pass: "zuum.tel"
	}
});

// TODO: Include the gateway addresses of all known mobile carriers if
// using thid method to send SMS
carrierSMTPFormat = {
	"AT&T": "@txt.att.net",
	"Sprint": "@pm.sprint.com",
	"T-Mobile": "@tmomail.net",
	"Verizon": "@vtext.com" 
};

myFirebaseRef.remove();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
//app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/', function(request, response) {
	// response.send("Just Testing");
	response.sendFile('index.html', { root: __dirname });
});

app.post('/', function(request, response) {
	
	// store the required POST data in an array where each cell corresponds
	// to the info of a particular tag/car. 
	// response.send(request.body.field_values);
	cars_info = request.body.field_values.split("\n");
	cars_info.pop();	// last element is an empty string
	auctionSite = request.body.mac_address.split('"').join("");
	readerId = myFirebaseRef.child(auctionSite);

	var antenna_id = 0;
	var epc = 1;
	var first_seen_time = 2;
	var RSSI = 3;
	for (eachCar in cars_info) {
		// eachCar will be in the form of"antenna_id,"epc",ts,RSSI"
		carInfo = cars_info[eachCar].split(",");
		carID = carInfo[epc].split('"').join("");

		readerId.child(carID).set({
			
			'Antennaid': carInfo[antenna_id],
			// divide the ts received by 1000 in order to work with Date() (Not sure if this is the best way to do but for now ...)
			'First_seen_time': (new Date(parseInt(carInfo[first_seen_time])/1000)).toString(),
			'RSSI': carInfo[RSSI]
		});

	}

	// TODO: Find a better way of doing this and replace the following
	// This is a very bad way of doing this and also not correct
	setTimeout(clearData, 8*1000);

	
	response.end();

});

function clearData(readerId) {
	console.log("hello");
	myFirebaseRef.remove();
}

app.post('/fromManheim', function(request, response) {
	
	//response.send("" +request.body.tag_id +"<br>"+request.body.car_name);
	var tagID = request.body.tag_id;
	var mobileNumber = request.body.mobile_number;
	var carrier = request.body.carrier_name;

	if (auctionSite == "") {
		response.send("Auction has not yet started. So your request will not be considered");
		response.end();
	}
	tagRef = myFirebaseRef.child(auctionSite).child(tagID);
	tagRef.on("value", sendSMS);

	function sendSMS(snapshot) {
		var carInfo = snapshot.val();
		if (carInfo != null) {
			// send SMS and detach callback

			var mailOptions = {
				from: "zuum.email@gmail.com",
				to: mobileNumber.trim() + carrierSMTPFormat[carrier].trim(),
				subject: "Testing ....",
				text: "car was at " + carInfo.First_seen_time
			}
			transport.sendMail(mailOptions, function(error, response) {
				if (error) {
					console.log(error);
				} else {
					console.log("Message sent");
				}
			});
			console.log("SMS ...", carInfo);
			// detach the callback after sending SMS
			tagRef.off("value", sendSMS);
			console.log("After Callback ", tagID);
		}
	}
	response.end();
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" +app.get('port'));
});
