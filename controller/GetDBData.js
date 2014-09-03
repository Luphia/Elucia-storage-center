var commands,
	storage,
	config;

module.exports = {
	init: function(_commands, _storage, _config) {
		if(_commands) commands = _commands;
		if(_storage) storage = _storage;
		if(_config) config = _config;

		return this;
	},

	parseURI: function(_uri) {
		return "resource." + _uri.split("/").join(".");
	},

	get: function(_req, _res) {
		var period_start = _req.params.period_start,
			period_end = _req.params.period_end;
			//cmd = _req.params.command;

		// if(cmd == "get_user_usage"){
			// cmd = "getUserUsageByUser";
		// }
		
		// command ¦³¶¶§Ç©Ê
		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList" : [
				[{"command": "getUserNerworkUsage", "progress": 25}],
				[{"command": "getUserDiskUsage", "progress": 25}],
				[{"command": "getSupplierNetworkUsage", "progress": 25}],
				[{"command": "getSupplierDiskUsage", "progress": 25}],
			],
			"data": {
				"period_start":period_start,
				"period_end":period_end
			}
		}, config);
		
		var CID = commands.post(myCommand);
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
			rtdata = commands.get(CID).getJobResult();
			_res && _res.send(JSON.stringify(rtdata));
		});
	},	
	
	getDiskHour: function(_req, _res) {
		var period_start = _req.params.period_start,
			period_end = _req.params.period_end,
			client_id = _req.params.client_id;
		// console.log(period_start);
		// console.log(period_end);
		// console.log(client_id);		

		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList" : [
				[{"command": "getUserUsageDiskHour", "progress": 100}],
			],
			"data": {
				"period_start":period_start,
				"period_end":period_end,
				"client_id":client_id
			}
		}, config);
		
		var CID = commands.post(myCommand);
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
			rtdata = commands.get(CID).getJobResult();
			_res && _res.send(JSON.stringify(rtdata));
		});
	},		

}