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

	supplierList: function(_req, _res)
	{

		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "supplierList", "progress": "+50"}],		
			],
			"data": 
			{
				"monitorData": storage.get("supplierMonitorData")
			}
		}, config);

		commands.post(myCommand);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	//比上面supplierList 多個map參數 給google map使用(command裡純判斷) 
	supplierListMap: function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "supplierList", "progress": "+50"}],		
			],
			"data": 
			{
				"map":"map"
			}
		}, config);

		commands.post(myCommand);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	supplierUpdateStatus : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "supplierUpdateStatus", "progress": "+50"}],		
			],
			"data": 
			{
				"status":_req.body.status,
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress
			}
		}, config);

		commands.post(myCommand);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	}
}