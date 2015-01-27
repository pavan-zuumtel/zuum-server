var express = require('express');
var bodyParser = require('body-parser');
var zuumFire = require('./modules/zuumfire.js');

var app = express();

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
  cars_info = request.body.field_values.split("\n");
  cars_info.pop();	// last element is an empty string

  zuumFire.sendData(cars_info);

  response.end();

});

app.post('/fromManheim', function(request, response) {

  var parameters = {
    tagID : request.body.tag_id,
    mobileNumber : request.body.mobile_number,
    carrier : request.body.carrier_name,
    vinNumber : request.body.vin_number
  };

  console.log("Inside /fromManheiem");
  console.log(parameters);
  
  if (parameters.mobileNumber.trim().length != 10) {
    // Only checks the length of the number but not whether it contains chars
    // or numbers 
    response.end("Not a valid number");
  }

  // check if there is a cancel request for the tagID by this user.
  // In scenarios where a user follows a tag, then cancels/unfollow and then 
  // follows it. Remove if there was a cancelRequest
  // zuumFire.checkCancelRequests(parameters);
  var resp = zuumFire.contactClient(parameters);

  response.end(resp);
});

app.post('/unFollow', function(request, response) {
  
  var cancelDetails = {
    mobileNumber: request.body.mobile_number.trim(),
    tagID: request.body.tag_id.trim()
  };
  console.log(cancelDetails);

  var resp = zuumFire.cancelReq(cancelDetails);

  response.end(resp);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" +app.get('port'));
});
