var express = require('express');
var bodyParser = require('body-parser');
var zuumFire = require('./modules/zuumfire.js');
var sms = require('./modules/sms.js');

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
  console.log("fv:", request.body.field_values);
  cars_info = request.body.field_values.split("\n");
  cars_info.pop();	// last element is an empty string

  zuumFire.sendData(cars_info);

  response.end();

});

app.post('/fromManheim', function(request, response) {

  var parameters = {
    tagID : request.body.tag_id.trim(),
    mobileNumber : request.body.mobile_number.trim(),
    carrier : request.body.carrier_name,
    vinNumber : request.body.vin_number,
    make: request.body.make,
    model: request.body.model,
    year: request.body.year,
    trim: request.body.trim,
    lane: request.body.lane,
    run: request.body.run
  };

  console.log("Inside /fromManheiem");
  console.log(parameters);
  
  if (parameters.mobileNumber.trim().length != 10) {
    // Only checks the length of the number but not whether it contains chars
    // or numbers 
    response.end("Not a valid number");
  }

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

app.post('/status', function(request, response) {
  var message = {
    text: request.body.message
  };
  var mobile = request.body.mobile_number.trim();
  var carrier = request.body.carrier_name;
  sms.sendStatusSMS(message, mobile, carrier);

  response.end();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" +app.get('port'));
});
