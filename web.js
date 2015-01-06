var express = require('express');
var bodyParser = require('body-parser');
var Firebase = require('firebase');
var sms = require('./modules/sms.js');

var app = express();
var myFirebaseRef = new Firebase("https://flickering-heat-3988.firebaseio.com/");
var auctionSite = "";	// Associate the mac_address of the reader at a place
var readerId;	// stores the ref to the reader/auctions location

var allReaders = [];	// list of all readers cuurrently in auction

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
  if (allReaders.indexOf(auctionSite) == -1) {
    // If this is the first time, a reader is sending data, it
    // probably means the auction has started. So delete all the
    // data sent by this reader after 8 hrs.
    readerId = myFirebaseRef.child(auctionSite);
    setTimeout(clearData, 8*60*60*1000, auctionSite);

    allReaders.push(auctionSite); 
  }

  var antenna_id = 0;
  var epc = 1;
  var first_seen_time = 2;
  var RSSI = 3;
  for (var eachCar in cars_info) {
    // eachCar will be in the form of"antenna_id,"epc",ts,RSSI"
    carInfo = cars_info[eachCar].split(",");
    carID = carInfo[epc].split('"').join("");

    readerId.child(carID).set({
      'Antennaid': carInfo[antenna_id],
      // divide the ts received by 1000 in order to work with Date() (Not sure if this is the best way to do but for now ...)
      'First_seen_time': (new Date(parseInt(carInfo[first_seen_time])/1000)).toLocaleString(),
      'RSSI': carInfo[RSSI]
    });
  }
  console.log("Hey");

  response.end();

});

function clearData(auctionSite) {
  ref = new Firebase(myFirebaseRef + '/' + auctionSite);
  ref.remove();

  ind = allReaders.indexOf(auctionSite);
  allReaders.splice(ind, 1);
}

app.post('/fromManheim', function(request, response) {
  var parameters = {
    tagID : request.body.tag_id,
    mobileNumber : request.body.mobile_number,
    carrier : request.body.carrier_name,
    vinNumber : request.body.vin_number
  };
  
  if (parameters.mobileNumber.trim().length != 10) {
    // Only checks the length of the number but not whether it contains chars or numbers 
    response.end("Not a valid number");
}

  if (auctionSite === "") {
    response.send("Auction has not yet started. So your request will not be considered");
    response.end();
  }
  tagRef = myFirebaseRef.child(auctionSite).child(parameters.tagID);
  tagRef.on("value", function(snapshot) {
    sms.sendSMS(snapshot, parameters);
  });

  console.log("hello");
  tagRef.off("value", sms.sendSMS);
  response.end();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" +app.get('port'));
});
