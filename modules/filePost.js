/*  test Case
var curl = require("./filePost.js");

var option = {};
option.host = "10.10.20.96";
option.port = 3000;
option.path = "/file/test" + Math.round(Math.random()*10000);

var option = {};
option.host = "http://10.10.20.94:3000/file/test" + Math.round(Math.random()*10000);

option.headers = {"Authorization": "Bearer 38b8501684a9f91c9542ce236edb4ce4ecd4eefaae2c4cc958bae3982654831a"};

data = {};
files = [{ name: 'restRequest.js', path: './restRequest.js' }];

callBack = function(_data) {console.log(_data)};
curl(option, data, files, callBack);

var request = require("request");
var option = {"url":"http://10.10.20.94:3000/file/a11.b22.c33.d44", "headers": {"Authorization": "Bearer e87146a0a03767a74e37571adb53daa8f4c4037f6cf429731e826e5261be5776"}}
request.post(option, function(e, r, data) {console.log(data);}).form().append("postFile", fs.createReadStream("./favicon.png"));
 */

module.exports = function(options, data, files, fn) {
	var request = require("request");
	var fs = require("fs");
	var option = {"url": options.host, "headers": options.headers};

//console.log(fs.createReadStream(files[0].path));
	request.post(option, 
		function(e, r, data) {
			fn && fn(data);
		}).form().append("postFile", fs.createReadStream(files[0].path));
	/*
	if (typeof(files) == 'function' || typeof(files) == 'undefined') {
		fn = files;
		files = [];
	}

	if (typeof(fn) != 'function') {
		fn = function() {};
	}

	if(typeof(options) == 'string') {
		options = {
			"host": options
		};
	}

	if (!options.port && !options.path) {
		var newOptions = require('url').parse(options.host);
		for(var key in newOptions) {
			options[key] = newOptions[key];
		}
		options.host = newOptions.hostname;
	}

	var fs = require('fs');
	var endl = "\r\n";
	var length = 0;
	var contentType = '';

	// If we have files, we have to chose multipart, otherweise we just stringify the query 
	if (files.length) {
		var boundary = '-----np' + Math.random();
		var toWrite = [];

		for(var k in data) {
			toWrite.push('--' + boundary + endl);
			toWrite.push('Content-Disposition: form-data; name="' + k + '"' + endl);
			toWrite.push(endl);
			toWrite.push(data[k] + endl);
		}

		var name = '', stats;
		for (var k in files) {
			if (fs.existsSync(files[k].path)) {
				// Determine the name
				name = (typeof(files[k].name) == 'string') ? files[k].name : files[k].path.replace(/\\/g,'/').replace( /.*\//, '' );

				// Determine the size and store it in our files area
				stats = fs.statSync(files[k].path);
				files[k].length = stats.size;

				toWrite.push('--' + boundary + endl);
				toWrite.push('Content-Disposition: form-data; name="' + files[k].param + '"; filename="' + name + '"' + endl);
				//toWrite.push('Content-Type: image/png');
				toWrite.push(endl);
				toWrite.push(files[k]);
			}
		}

		// The final multipart terminator
		toWrite.push('--' + boundary + '--' + endl);

		// Now that toWrite is filled... we need to determine the size
		for(var k in toWrite) {
			length += toWrite[k].length;
		}

		contentType = 'multipart/form-data; boundary=' + boundary;
	}
	else {
		data = require('querystring').stringify(data);

		length = data.length;
		contentType = 'application/x-www-form-urlencoded';
	}

	options.method = 'POST';
	if(!options.headers) {options.headers = {};}
	options.headers["Content-Type"] = contentType;
	options.headers["Content-Length"] = length;

	var req = require('http').request(options, function(res) {
		res.setEncoding('utf-8');
		var responseString = '';

		res.on('data', function(data) {
			responseString += data;
		});

		res.on('end', function() {
			fn && fn(responseString);
		});
	});

	// Multipart and form-urlencded work slightly differnetly for sending
	if (files.length) {
		for(var k in toWrite) {
			if (typeof(toWrite[k]) == 'string') {
				req.write(toWrite[k]);
			}
			else {
				// @todo make it work better for larger files
				req.write(fs.readFileSync(toWrite[k].path, 'binary'));
				req.write(endl);
			}
		}
	}
	else {
		req.write(data);
	}
	req.end();

	return req;
	*/
}