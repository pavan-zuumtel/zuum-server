var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

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
	response.send(fs.readFileSync('index.html').toString());
});

app.post('/', function(request, response) {
	response.send("" +request.body.reader_name +"<br>"+request.body.mac_address);
	console.log(request.body.reader_name);
	//response.send(request.body.time);
});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" +app.get('port'));
});
