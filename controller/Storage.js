var commands,
	storage,
	config;

module.exports = {
	flag: false,
	init: function(_command, _storage, _config) {
		commands = _command
		storage = _storage;
		config = _config;
		return this;
	},

	parseURI: function(_uri) {
		if(typeof(_uri) == "undefined") {
			return "";
		}
		else {
			return "" + _uri.split("/").join(".");
		}
	},

	get: function(_req, _res) {
		req = _req;
		res = _res;

		var key = module.exports.parseURI(_req.params[0]);
			rtdata = storage.get(key);

		module.exports.result(_res, rtdata);
	},

	result: function(_res, _data) {
		_res.send(JSON.stringify(_data));
		// console.log(JSON.stringify(_data));
	}
}