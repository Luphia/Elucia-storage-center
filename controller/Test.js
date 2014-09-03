var storage,
	commands,
	config;

module.exports = {
	flag: false,
	init: function(_command, _storage, _config) {
		storage = _storage;
		commands = _command;
		config = _config;
		storage.post("test", 1);
		return this;
	},

	parseURI: function(_uri) {
		return "resource." + _uri.split("/").join(".");
	},

	test: function(_req, _res) {
		var rtdata = {},
			testModel = _req.params[0];

		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList": [
				[{"command": testModel, "progress": "100"}]
			],
			"data": {
				storeKey: "usage",
				storeValue: "savedata",
				application_id: "4",
				detailJson: { private_ip: "10.10.21.18" },
				tableImageStore: [ {display_name: "babu"} ],
				domIP: config["domIP"],
				domPath: config["domPath"]
			}
		}, config);

		commands.post(myCommand);
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {});
		rtdata = myCommand.getOutput();
		_res && _res.send(JSON.stringify(rtdata));
	},

	testMethod: function(_req, _res) {
		var token = "";
		_req.headers.authorization && ( token = _req.headers.authorization.split("Bearer ")[1]) || (token = "");

		var rtdata = {
			method: _req.method,
			session: _req.session,
			token: token,
			uri: _req.params[0],
			data: _req.body,
			file: _req.files
		}

		_res && _res.send(rtdata);
	}
}