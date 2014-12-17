var express = require('express');
var bodyParser = require('body-parser');
var Firebase = require('firebase');

var app = express();
var myFirebaseRef = new Firebase("https://flickering-heat-3988.firebaseio.com/");
var carId;

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
	// TODO: Check the field_values 

	/*carId = myFirebaseRef.child(request.body.mac_address);
	carId.set({
		// reader_name: request.body.reader_name,
		// mac_address: request.body.mac_address,
		'field_names': request.body.field_names,
		'field_values': request.body.field_values
	});*/

	console.log("New One\n");
	console.log(request.body.reader_name);
	console.log(request.body.mac_address);
	console.log(request.body.line_ending);
	console.log(request.body.field_delim);
	console.log(request.body.field_names);
	console.log(request.body.field_values);
	request.body.field_values = []
	//response.send(request.body.time);
});

app.post('/fromManheim', function(request, response) {
	
	response.send("" +request.body.tag +"<br>"+request.body.time);
	myFirebaseRef.on("value", function(snapshot) {
		console.log(snapshot.val());
	}, function(errorObject) {
		console.log("Read operation failed: " +errorObject.code);
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" +app.get('port'));
});
