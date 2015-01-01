var http = require('http');

var HOST = 'api.edmunds.com';
var fmt = 'json';
var api_key = 'nj3gudefmd9kfatezgheaz7b';
var endpoint = '/api/vehicle/v2/vins';

var options = {
	hostname: HOST 
};

var data = '';
var error = '';
function decodeVin(){
	http.request(options, function(response) {
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			console.log(data);
			console.log("I'm jere");
			return {
				data: data,
				error: error
			}
		});
		if(response.statusCode != 200) {
			error = true;
		} else {
			error = false;
		}
	}).end();
}

function getInfo(vin_number) {
	// construct the path to make the api call
	var path = endpoint + vin_number + '?fmt=' + fmt + '&api_key=' + api_key;
	options.path = path;

	console.log(decodeVin());
	console.log('Now..');
}

getInfo('');

exports.getInfo = getInfo;

