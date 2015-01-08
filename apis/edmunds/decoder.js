var http = require('http');
var events = require('events');
var util = require('util');

var emitter = new events.EventEmitter();

var HOST = 'api.edmunds.com';
var fmt = 'json';
var api_key = 'nj3gudefmd9kfatezgheaz7b';
var endpoint = '/api/vehicle/v2/vins/';

var options = {
  hostname: HOST 
};

var decodeVin = function(vin_number) {
  this.path = endpoint + vin_number + '?fmt=' + fmt + '&api_key=' + api_key;
  options.path = this.path;
  this.data = '';
  this.error = '';
  console.log(options.path);
  events.EventEmitter.call(this);
  
  var obj = this;

  http.request(options, function(response) {
    response.on('data', function(chunk) {
      obj.data += chunk;
    });
    response.on('end', function() {
      obj.data = JSON.parse(obj.data);
      obj.emit('carDetails');
    });

    if(response.statusCode != 200) {
      obj.error = true;
    } else {
      obj.error = false;
    }
  }).end();
};

// decodeVin.prototype.__proto__ = events.EventEmitter.prototype;
util.inherits(decodeVin, events.EventEmitter);
exports.decodeVin = decodeVin;
