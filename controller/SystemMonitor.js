var commands,
	storage,
	config,
	fileHealthy;

module.exports = {
	init: function(_commands, _storage, _config, _fileHealthy) {
		if(_commands) commands = _commands;
		if(_storage) storage = _storage;
		if(_config) config = _config;
		if(_fileHealthy) fileHealthy = _fileHealthy;

		return this;
	},

	parseURI: function(_uri) {
		return "resource." + _uri.split("/").join(".");
	},
	
	getHeartbeat: function(_req, _res) {

	},

	monitor: function(_req, _res) {
		var rtdata = {};

		var supplierMonitorPeriod = config.supplierMonitorPeriod;
		//var againCommand = ":again:" + supplierMonitorPeriod.toString();
		var againCommand = ":again:" + supplierMonitorPeriod;
		//console.log(againCommand);
		
		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList": [
				[{"command": ":read:storeKey2:storeValue2", "progress": "+5"}],
				[{"command": "supplierMonitor", "progress": "+70"}],
				[{"command": ":write:storeKey:storeValue", "progress": "+25"}],
				[{"command": againCommand, "progress": 0}]
			],
			"data": {
				data: {},
				serverIP: config.serverIP,
				storeKey2: "supplierMonitorData",
				storeValue2: "oldData",
				supplierMonitorPeriod: supplierMonitorPeriod
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute();
		var CID = commands.post(myCommand);

		rtdata = myCommand.getOutput();
		_res && _res.send(JSON.stringify(rtdata));
	},

	repairFiles: function(_req, _res) {
		var fileRepairPeriod = config.fileRepairPeriod;
		var againCommand = ":again:" + fileRepairPeriod;
		
		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList": [
				[{"command": "fileRepair", "progress": 50}],
				[{"command": againCommand, "progress": 0}]
			],
			"data": {
				fileList: fileHealthy.getDangerFiles()
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute();
		var CID = commands.post(myCommand);

		rtdata = myCommand.getOutput();
		_res && _res.send(JSON.stringify(rtdata));
	}
}