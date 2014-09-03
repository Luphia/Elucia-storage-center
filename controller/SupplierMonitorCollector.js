var commands,
	storage,
	config,
	fileHealthy;

module.exports = {
	init: function(_commands, _storage, _config, _fileHealthy) {
		if(_commands) commands = _commands;
		if(_storage) storage = _storage;
		if(_config) config = _config;
		fileHealthy = _fileHealthy;

		return this;
	},

	parseURI: function(_uri) {
		return "resource." + _uri.split("/").join(".");
	},

	getUserUsage: function(_req, _res) {
		var rtdata = {};
		//console.log("in monitor");
		var supplierMonitorPeriod = config.supplierMonitorPeriod;
		//var againCommand = ":again:" + supplierMonitorPeriod.toString();
		var againCommand = ":again:" + "5000";
		//console.log(againCommand);
		
		var cCommand = require( '../modules/command.js' )
			myCommand = new cCommand().init({
			"progress": 0,
			"todoList": [
				[{"command": "getUserUsageByUser", "progress": "+70"}],
				[{"command": againCommand, "progress": 0}]
			],
			"data": {
				data: {},
				serverIP: config.serverIP
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute();
		var CID = commands.post(myCommand);

		rtdata = myCommand.getOutput();
		_res && _res.send(JSON.stringify(rtdata));
	},	
	
	monitor: function(_req, _res) {
		var rtdata = {};
		console.log("in monitor");
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
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
			var monitorData = myCommand.getOutput().data.data,
				fileData = fileHealthy.nodes;

			for(var key in fileData) {
				var id = fileHealthy.nodeDetail[fileData[key]].id;
				// no such node or node is crash
				if(!monitorData[id] || monitorData[id].status != 1) {
					console.log(">>> remove node [" + fileData[key] + "]");
					fileHealthy.removeNode(fileData[key]);
				}
			}
			for(var key in monitorData) {
				var ip = monitorData[key].ip;
				// new node
				if(fileData.indexOf(ip) == -1 && monitorData[key].status == 1) {
					var detail = {"id": key, "name": monitorData[key].name, "ip": ip};

					fileHealthy.addNode(ip, detail);
					console.log(">>> add node [" + ip + "]");
				}
			}

			// console.log(fileHealthy.getSummary());
		});
		var CID = commands.post(myCommand);

		rtdata = myCommand.getOutput();
		_res && _res.send(JSON.stringify(rtdata));
	},

	heartbeat: function(_req, _res) {
		
	}
}