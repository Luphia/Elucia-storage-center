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
			myCommand = commands.get(key);

			if(myCommand == -1) {
				rtdata = {
					result: 0,
					message: "command not found"
				}
			} else {
				rtdata = myCommand.getOutput();
			}

		_res.send(JSON.stringify(rtdata));
	},

	delete: function(_req, _res) {
		var key = _req.params[0],
			rtdata = commands.get(key);
			rtdata.stop();

		_res.send(JSON.stringify(rtdata));
	}
}