module.exports = function() {
	var 
	execute = function(_option) {
		if(!_option["path"]) {
			var newOptions = require('url').parse(_option.host);
			_option.host = newOptions.hostname;
			_option.port = newOptions.port;
			_option.path = newOptions.path;
		}
		if(!_option["callBack"]) {
			_option["callBack"] = {"success": function(d, h) {
				console.log(d);
			}};
		}

		var http = require('http'),
			postString = typeof(_option["data"]) == "undefined"? "": JSON.stringify(_option["data"]),
			headers = {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postString)
			};

		if(!!_option["headers"]) {
			for(var key in _option["headers"]) {
				headers[key] = _option["headers"][key];
			}
		}

		var	options = {
				host: _option["host"],
				port: typeof(_option["port"]) == "undefined" ? 80: _option["port"],
				path: _option["path"],
				method: _option["method"],
				headers: headers
			},
			req = http.request(options, function(res) {
				res.setEncoding('utf-8');
				var responseString = '';

				res.on('data', function(data) {
					responseString += data;
				});

				res.on('end', function() {
					_option["callBack"]["success"] && _option["callBack"]["success"](responseString, res.headers);
				});
			});

		req.on('error', function(e) {
			console.log("ignoring exception: " + e + " " + typeof(_option["callBack"]));
			_option["callBack"]["fail"] && _option["callBack"]["fail"](e);
		});

		req.write(postString);
		req.end();
		// _option["callBack"] && _option["callBack"](false, "");
	},

	get = function(_option) {
		_option["method"] = "GET";
		execute(_option);
	},

	put = function(_option) {
		_option["method"] = "PUT";
		execute(_option);
	},

	post = function(_option) {
		_option["method"] = "POST";
		execute(_option);
	},

	del = function(_option) {
		_option["method"] = "DELETE";
		execute(_option);
	},

	that = {
		execute: execute,
		get: get,
		put: put,
		post: post,
		del: del
	};

	return that;
};