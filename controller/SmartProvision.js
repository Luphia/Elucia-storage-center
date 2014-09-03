var commands,
	storage,
	config;

module.exports =
{
	init : function(_commands,_storage,_config)
	{
		commands = _commands;
		storage = _storage;
		config = _config;

		return this;
	},

	getReplication: function(_req, _res) {
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": ":read:storeKey:dataKey", "progress": "+10"}],
				[{"command": "smartProvision", "progress": "+30"}],	
				[{"command": ":write:storeKey:dataKey", "progress": "+10"}],
				[{"command": "metaDuplication", "progress": "+50"}]
			],
			"data": 
			{
				"pn": 1,
				"storeKey": "provisionNum",
				"dataKey": "pn",
				"selectsNum": config.fileStrategy.replication,
				"clientId": _req.params.clientId,
				"path": _req.params[0],
				"meta": {
					"realpath": _req.params[0],
					"isRealpath": true
				}
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	getSupplierPath : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": ":read:storeKey:dataKey", "progress": "+30"}],
				[{"command": "smartProvision", "progress": "+40"}],	
				[{"command": ":write:storeKey:dataKey", "progress": "+30"}]	
			],
			"data": 
			{
				"pn":1,
				"storeKey": "provisionNum",
				"dataKey": "pn",
				"selectsNum":config.fileStrategy.replication-1,
				"ip":_req.headers['public-ip'] || _req.connection.remoteAddress
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	checkNode: function(_req, _res)
	{
		var rtdata = new require("../modules/jobResult")();
		if(Math.random() > 0.3) {
			rtdata.setResult(1);
		}
		_res && _res.send(rtdata.toJSON());
	}
}