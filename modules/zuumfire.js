var Firebase = require('firebase');
var sms = require('./sms.js');
var moment = require('moment-timezone');

var firebase_url = "https://zuumtelserver.firebaseio.com/";
var myFirebaseRef = new Firebase(firebase_url);

var auctionSite = "AuctionSite-1";
var readerId;	// stores the ref to the reader/auctions location

var auctionStarted = false;

var antenna_id = 0;
var epc = 1;
var first_seen_time = 2;
var RSSI = 3;

// Store the details of cancel requests in the following way:
// {
//    mobileNumber1 : {tagID: true },
//    mobileNumber2: {tagID1: true, tagID2: ..},
//
// }
// So before sending an sms, check if he submitted a cancel req.
var cancelRequests = {};

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
    
    carID = removeStartingZeros(carID);
    console.log("see:", carID);


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
  // ind = allReaders.indexOf(auctionSite);
  // allReaders.splice(ind, 1);
}

function removeStartingZeros(str) {
  var eachChar = 0;

  for (eachChar in str) {
    if(str[eachChar] != '0') {
      break;
    }
  }
  return str.slice(eachChar);
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
      // check to see if the user has later decided to unfollow the tag and
      // submitted a cancel/unfollow request
      if (cancelRequests.hasOwnProperty(parameters.mobileNumber)) {
        var cancelIds = cancelRequests[parameters.mobileNumber];
        if(!cancelIds.hasOwnProperty(parameters.tagID)) {
          // No cancel req. for this tagId. so send sms
          console.log("ssend...");
          sms.sendSMS(snapshot, parameters);
        }
      } else {
        console.log("snnnd");
        sms.sendSMS(snapshot, parameters);
      }
      console.log("some ..");
      tagRef.off("value", ref);
    }
  });
  resp = "success";
  return resp;
};

var cancelReq = function(cancelDetails) {
  var mobileNumber = cancelDetails.mobileNumber;
  var tagID = cancelDetails.tagID;
  var discardedTagIds = {};

  if(cancelRequests.hasOwnProperty(mobileNumber)) {
    discardedTagIds = cancelRequests[mobileNumber];
    discardedTagIds[tagID] = true;  //
    console.log("discarded some tagID");
  } else {
    discardedTagIds[tagID] = true;
    cancelRequests[mobileNumber] = discardedTagIds;
  }

  return "SUCCESS";
};

var checkCancelRequests = function(parameters) {
  var mobileNumber = parameters.mobileNumber.trim();
  var tagID = parameters.mobileNumber.trim();
  var discardedTagIds;
  console.log("IN checkCancelRequests");

  if(cancelRequests.hasOwnProperty(mobileNumber)) {
    discardedTagIds = cancelRequests[mobileNumber];
    console.log("deleting ..", tagID);
    delete discardedTagIds[tagID];
  }
   
};

exports.sendData = sendData;
exports.contactClient = contactClient;
exports.cancelReq = cancelReq;
exports.checkCancelRequests = checkCancelRequests;
