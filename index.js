var http = require("http");

http.createServer(function(request, response) {
	response.writehead(200, {"Content-Type": "text/plain"});
	response.write("Just testing");
	response.end();
}).listen(5000);
