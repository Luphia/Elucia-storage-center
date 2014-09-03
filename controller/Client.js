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

	clientList : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "clientList", "progress": "+50"}],		
			],
			"data": 
			{
				"clientId": _req.session.loginData.clientId
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	},

	clientDiskUsage : function(_req, _res)
	{
		var folderName = _req.params[0],
			token,
			cCommand = require( '../modules/command.js' );

		//get token
		_req.headers.authorization && ( token = _req.headers.authorization.split("Bearer ")[1]);

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "clientDiskUsage", "progress": "50"}]
			],
			"data": 
			{
				"folderName":folderName,
				"token":token
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});		
	},

	clientUpdatePwd : function(_req, _res)
	{
		var token,
			oldPassword = _req.body.oldPassword,
			newPassword = _req.body.newPassword,
			cCommand = require('../modules/command.js');

		//get token
		_req.headers.authorization && ( token = _req.headers.authorization.split("Bearer ")[1]);

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "clientUpdatePwd", "progress": "50"}]
			],
			"data": 
			{
				"token":token,
				"newPassword":newPassword,
				"oldPassword":oldPassword
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});		
	}
}