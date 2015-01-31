var Firebase = require('firebase');
var veh_url = 'https://zuumtel.firebaseio.com/auctions/cade/vehicles';
var ref = new Firebase(veh_url);
var vehichles;

ref.on("value", function(snapshot) {
  vehichles = snapshot.val();
}, function(error) {
    console.log("Read from vehichle database failed:", error.code);
});

var confirmTag = function(tag_id) {
  if (vehichles.hasChild(tag_id))
    return true;
  else
    return false;
};


exports.confirmTag = confirmTag;