var Firebase = require('firebase');
var veh_url = 'https://zuumtel.firebaseio.com/auctions/cade/vehicles';
var ref = new Firebase(veh_url);
var vehichles;
var vehichles_data;


var veh_lane_url = "https://zuumtel.firebaseio.com/auctions/cade/lanes/"; 


ref.on("value", function(snapshot) {
  vehichles = snapshot;
  vehichles_data = snapshot.val();
}, function(error) {
    console.log("Read from vehichle database failed:", error.code);
});

var confirmTag = function(tag_id, antenna_id, exists) {
  if (vehichles.hasChild(tag_id)) {
    veh_info = vehichles_data[tag_id];
    var lane = veh_info.lane;

    console.log("antenna_id: ", antenna_id);
    console.log("type:", typeof antenna_id);
    console.log("lane:", typeof lane);
    console.log("ex:", exists);

    if(lane == antenna_id && exists === false) {
      var url = veh_lane_url + lane + '/current_run';
      var runRef = new Firebase(url);

      runRef.transaction(function(current_run_no) {
        return current_run_no + 1;
      });
    
    }

    return true;
  
  } else {
    return false;
  
  }
};


exports.confirmTag = confirmTag;
