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

	infoGet :  function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "configInfoGet", "progress": "+50"}],		
			],
			"data": 
			{
				
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	infoSave : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "configInfoSave", "progress": "+50"}],		
			],
			"data": 
			{
				"tokenTime":_req.body.tokenTime,
				"fileRepair":_req.body.fileRepair,
				"fileDivision":_req.body.fileDivision,
				"fileReplication":_req.body.fileReplication,
				"sysMonitorPeriod":_req.body.sysMonitorPeriod
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
			config.reload();
		});
	}
}