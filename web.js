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
	response.send(request.body.field_values);
	cars_info = request.body.field_values.split("\n");
	console.log("Last element: " +cars_info.pop());	// last element is an empty string
	auctionSite = request.body.mac_address
	readerId = myFirebaseRef.child(auctionSite);
	var antenna_id = 0;
	var epc = 1;
	var first_seen_time = 2;
	var RSSI = 3;
	for (eachCar in cars_info) {
		// eachCar will be in the form of"antenna_id,"epc",ts,RSSI"
		carInfo = cars_info[eachCar].split(",");
		carID = carInfo[epc];

		readerId.child(carID).set({
			
			'Antennaid': carInfo[antenna_id],
			'First_seen_time': carInfo[first_seen_time],
			'RSSI': carInfo[RSSI]
		});
	}

	console.log("New One\n");
	console.log(request.body.reader_name);
	console.log(request.body.mac_address);
	console.log(request.body.line_ending);
	console.log(request.body.field_delim);
	console.log(request.body.field_names);
	console.log(request.param('field_values').length);
	console.log(cars_info);
});

app.post('/fromManheim', function(request, response) {
	
	//response.send("" +request.body.tag_id +"<br>"+request.body.car_name);
	var tagID = request.body.tag_id;
	var mobileNumber = request.body.mobile_number;
	var carrier = request.body.carrier_name;

	// For now, Just consider AT&T (TODO)
	var carrierSMTPFormat = "@txt.att.net";
	/*
	myFirebaseRef.child(auctionSite).child(tagID).on("value", function(snapshot) {
		var carInfo = snapshot.val();
		if (carInfo != null) {
			// Send SMS and detach the call back

			console.log("SMS ...");
			this.off();
		}
		console.log(carInfo);
	}, function(errorObject) {

		console.log("Read operation failed: " +errorObject.code);
	});
	*/
	tagRef = myFirebaseRef.child(auctionSite).child(tagID);
	tagRef.on("value", sendSMS);

	function sendSMS(snapshot) {
		var carInfo = snapshot.val();
		if (carInfo != null) {
			// send SMS and detach callback

			var mailOptions = {
				from: "zuum.email@gmail.com",
				to: mobileNumber.trim() + carrierSMTPFormat.trim(),
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
	response.send("OK");
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" +app.get('port'));
});
