var Firebase = require('firebase');
var sms = require('./sms.js');

var firebase_url = "https://flickering-heat-3988.firebaseio.com/";
var myFirebaseRef = new Firebase(firebase_url);

var auctionSite = "AuctionSite-1";
var readerId;	// stores the ref to the reader/auctions location

var auctionStarted = false;

var antenna_id = 0;
var epc = 1;
var first_seen_time = 2;
var RSSI = 3;


var sendData = function(cars_info) {

  if (auctionStarted === false) {

    // auctionSite = request.body.mac_address.split('"').join("");
    myFirebaseRef.remove();
    // If this is the first time, a reader is sending data, it
    // probably means the auction has started. So delete all the
    // data sent by this reader after 8 hrs.
    readerId = myFirebaseRef.child(auctionSite);
    setTimeout(clearData, 8*60*60*1000, auctionSite);
    
    auctionStarted = true;
  }

  for (var eachCar in cars_info) {
    // eachCar will be in the form of"antenna_id,"epc",ts,RSSI"
    carInfo = cars_info[eachCar].split(",");
    carID = carInfo[epc].split('"').join("");

    readerId.child(carID).set({
      'Antennaid': carInfo[antenna_id],
      // divide the ts received by 1000 in order to work with Date()
      // (Not sure if this is the best way to do but for now ...)
      'First_seen_time': 
        (new Date(parseInt(carInfo[first_seen_time])/1000)).toLocaleString(),
      'RSSI': carInfo[RSSI]
    });
  }
};

function clearData(auctionSite) {
  ref = new Firebase(firebase_url + auctionSite);
  console.log("time to clear");
  ref.remove();

  auctionStarted = false;
  // ind = allReaders.indexOf(auctionSite);
  // allReaders.splice(ind, 1);
}


var contactClient = function(parameters) {
  var resp;

  if (auctionStarted === false) {
    // resp = 'Auction has not yet started. So your request will not be' + 
    // 'considered";
    myFirebaseRef.remove(); // Just clear data if present from yesterday's auc.
    // return resp;
  }

  tagRef = myFirebaseRef.child(auctionSite).child(parameters.tagID);
  ref = tagRef.on("value", function(snapshot) {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      console.log("hi");
      sms.sendSMS(snapshot, parameters);
      tagRef.off("value", ref);
    }
  });
  resp = "success";
  return resp;
};

exports.sendData = sendData;
exports.contactClient = contactClient;
