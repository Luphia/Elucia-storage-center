var commands;

module.exports = {
	init: function(_commands) {
		commands = _commands;
		return this;
	},

	parseURI: function(_uri) {
		return "resource." + _uri.split("/").join(".");
	},

	get: function(_req, _res) {
		var key = _req.params[0],
			dataPath = "../data/" + key + ".json";

		rtdata = require(dataPath);
		_res.send(JSON.stringify(rtdata));
	}
}