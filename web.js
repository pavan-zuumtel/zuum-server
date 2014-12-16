var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var Firebase = require('firebase');

var app = express();
var myFirebaseRef = new Firebase("https://flickering-heat-3988.firebaseio.com/");

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
//app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/', function(request, response) {
	// response.send("Just Testing");
	response.send(fs.readFileSync('index.html').toString());
});

app.post('/', function(request, response) {
	response.send("" +request.body.reader_name +"<br>"+request.body.mac_address);
	myFirebasRef.set({
		reader_name: request.body.reader_name,
		mac_address: request.body.mac_address,
		field_names: request.body.field_names,
		field_values: request.body.field_values
	});

	console.log(request.body.reader_name);
	console.log(request.body.mac_address);
	console.log(request.body.line_ending);
	console.log(request.body.field_delim);
	console.log(request.body.field_names);
	console.log(request.body.field_values);
	//response.send(request.body.time);
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" +app.get('port'));
});
