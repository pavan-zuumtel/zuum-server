var Firebase = require('firebase');
var sms = require('./sms.js');
var moment = require('moment-timezone');
var vehfire = require('./vehfire.js');

var firebase_url = "https://zuumtelserver.firebaseio.com/";
var myFirebaseRef = new Firebase(firebase_url);

var auctionSite = "AuctionSite-1";
var readerId;	// stores the ref to the reader/auctions location

var auctionStarted = false;

var antenna_id = 0;
var epc = 1;
var first_seen_time = 2;
var RSSI = 3;

var tagSnapshot;

myFirebaseRef.child(auctionSite).on('value', function(snapshot){
  tagSnapshot = snapshot;
});

var cancelRequests = {};
var cReqs = {};

var timeZone = 'America/Los_Angeles';

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
    
    carID = carID.replace(/^[0]+/g, "");
    console.log("see:", carID);

    // check if the tagID/carID is actually from a car in our database
    if(!vehfire.confirmTag(carID, carInfo[antenna_id], tagSnapshot.hasChild(carID)))
      continue;

    readerId.child(carID).set({
      'Antennaid': carInfo[antenna_id],
      // divide the ts received by 1000 in order to work with Date()
      // (Not sure if this is the best way to do but for now ...)
      'First_seen_time': moment(Number(carInfo[first_seen_time]
)/1000).tz(timeZone).format(),
      'RSSI': carInfo[RSSI]
    });
  }
};

function clearData(auctionSite) {
  ref = new Firebase(firebase_url + auctionSite);
  console.log("time to clear");
  ref.remove();

  auctionStarted = false;
}

var contactClient = function(parameters) {

  if (auctionStarted === false) {
    // resp = 'Auction has not yet started. So your request will not be' + 
    // 'considered";
    myFirebaseRef.remove(); // Just clear data if present from yesterday's auc.
    // return resp;
  }

  tagRef = myFirebaseRef.child(auctionSite).child(parameters.tagID);
  requestID = parameters.mobileNumber + parameters.tagID;
  var off;
  cReqs[requestID] = tagRef.on("value", function(snapshot) {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      console.log("hi");
      
      console.log("some ..");
      off = true;
      // This callback is called twice if the data already exists at this
      // location(even after calling off). So, I'm using the variable off
      // and calling off after this callback and it seems to be working..
      // If you find a better method, change it.
      sms.sendSMS(snapshot, parameters);
      tagRef.off("value", cReqs[requestID]);
    }
  });
  if(off)
    tagRef.off("value", cReqs[requestID]);
  
  return "SUCCESS";
};

var cancelReq = function(cancelDetails) {
  var mobileNumber = cancelDetails.mobileNumber;
  var tagID = cancelDetails.tagID;
  
  requestID = mobileNumber + tagID;
  var tagRef = myFirebaseRef.child(auctionSite).child(cancelDetails.tagID);
  tagRef.off('value', cReqs[requestID]);

  return "SUCCESS";
};

exports.sendData = sendData;
exports.contactClient = contactClient;
exports.cancelReq = cancelReq;
