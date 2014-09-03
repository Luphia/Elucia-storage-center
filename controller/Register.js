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

	checkAccount : function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init({
				"progress": 0,
				"todoList":
				[
					[{"command": "checkAccount", "progress": 100}]
				],
				"data":
				{
					"clientId": clientId,
					"account": _req.params.account,
					"user": _req.session.loginData
				}
			}, config);

			commands.post(myCommand); // for debug

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	checkPassword : function(_req, _res) {
		var cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init({
				"progress": 0,
				"todoList":
				[
					[{"command": "checkPassword", "progress": 100}]
				],
				"data":
				{
					"account": _req.params.account,
					"password": _req.params.password
				}
			}, config);

			commands.post(myCommand); // for debug

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	registerClient : function(_req, _res)
	{
		var username = _req.body.username,
			password = _req.body.password,
			machineNumber = _req.body.machineNumber,
			machineIp = _req.body.machineIp,
			machineName = _req.body.machineName,
			contact = _req.body.contact,
			status = _req.body.status,
			rtdata = {};

		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "registerClient", "progress": "+50"}]
			],
			"data": 
			{
				"username":username,
				"password":password,
				"machineNumber":machineNumber,
				"machineIp":machineIp,
				"machineName":machineName,
				"contact":contact,
				"status":status
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			var CID = commands.post(myCommand);
			_res && _res.send(myCommand.getJobResult());
		});	
	},

	registerSupplier : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "registerSupplier", "progress": "+50"}]
			],
			"data": 
			{
				"name":_req.body.name,
				"contact":_req.body.contact,
				"totalSpace":_req.body.totalSpace,
				"bandwith":_req.body.bandwith,
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress,
				"port":_req.body.port,
				"machineUId":_req.body.machineUId,
				"clientId":_req.body.clientId
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			var CID = commands.post(myCommand);
			_res && _res.send(myCommand.getJobResult());
		});	
	}
}