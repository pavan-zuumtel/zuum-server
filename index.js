var http = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function('/', function(request, response) {
	response.send("Just Testing");
}));
