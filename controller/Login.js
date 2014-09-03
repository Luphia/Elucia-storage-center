/*
*
*
*/

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

	parseURI: function(_uri) 
	{
		return "resource." + _uri.split("/").join(".");
	},

	login : function(_req, _res)
	{
		var username = _req.body.username,
			password = _req.body.password,
			rtdata = {};

		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "login", "progress": "+50"}],
				[{"command": ":continue:check", "progress": "+0"}],
				[{"command": "tokenCreate", "progress": "+50"}]			
			],
			"data": 
			{
				"username": username,
                "password": password,
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress
			}
		}, config);

		//send command
		commands.post(myCommand);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			//original data info
			_data = myCommand.getOutput();

			if(_data.data.effectNum == 1)
			{			
				var jobResult = myCommand.getJobResult();
				_req.session.loginData = 
				{
					"username": _data.data.username,
					"clientId": _data.data.clientId,
					"role": _data.data.role,
					"token":jobResult.data.token,
					"ip":_data.data.ip
				}
			}
			
			_res && _res.send(myCommand.getJobResult());
		});
	},
	checkLogin: function(_req, _res) {
		var cResult = require("../modules/jobResult"),
			rtdata = new cResult();

		if(_req.session.loginData.clientId > -1 || _req.session.loginData.clientId == 0){
			rtdata.setResult(1);
			rtdata.setData({"token": _req.session.loginData.token});
		}
		else {
			rtdata.setResult(-1);
			rtdata.setMessage("not login");
		}

		_res && _res.send(rtdata.toJSON());
	},

	logout : function(_req, _res)
	{
		var rtdata = {};
		var cCommand = require( '../modules/command.js' );

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "logout", "progress": "+10"}]	
			],
			"data": 
			{
				"token":_req.session.loginData.token
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			delete _req.session.loginData;
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
		
	},

	tokenRenew : function(_req,_res)
	{
		var rtdata = {};
		var cCommand = require( '../modules/command.js' );

		if(typeof _req.session.loginData != "undefined")
		{
			var myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "tokenRenew", "progress": "+10"}]	
				],
				"data": 
				{
					"reqToken":_req.params.token,
					"ip": _req.headers['public-ip'] || _req.connection.remoteAddress
				}
			}, config);

			var cWorker = require("../roles/Worker");
			var worker = new cWorker().init(storage).assign(myCommand).execute(function() {
	
				rtdata = myCommand.getOutput();
				_res && _res.send(myCommand.getJobResult());
			});
		}
		else
		{
			var myCommand = new cCommand().init({});

			_data = myCommand.getJobResult();
			_data.message ="not login status";
			_data.result = 1;
			_res && _res.send(_data);
		}
	},

	tokenCheck: function(_req,_res) 
	{
		var rtdata = {}
		,	cCommand = require( '../modules/command.js' )
		,	myCommand = new cCommand().init({
			"progress": 0,
			"todoList": [
				[{"command": "tokenCheck", "progress": "+10"}]	
			],
			"data": {
				"token": _req.params.token
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() {

			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	tokenDelete : function(_req,_res)
	{
		var rtdata = {};
		var cCommand = require('../modules/command.js');

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "tokenDelete", "progress": "+10"}]	
			],
			"data": 
			{
				"token":_req.params.token
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function(){

			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	getUserData: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "getUserData", "progress": "+50"}]
				],
				"data": 
				{
					"clientId": clientId,
					"user": _req.session.loginData
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	getUserConfig: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "getUserConfig", "progress": "+50"}]
				],
				"data": 
				{
					"clientId": clientId,
					"user": _req.session.loginData
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	genKey: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "keyGenerate", "progress": 100}]
				],
				"data": 
				{
					clientId: clientId
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	postUserKey: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			escrowKey = _req.body.escrowKey,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "keyPost", "progress": 100}]
				],
				"data": 
				{
					clientId: clientId,
					escrowKey: escrowKey
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	getUserKey: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "keyGet", "progress": 100}]
				],
				"data": 
				{
					clientId: clientId
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	},

	deleteUserKey: function(_req, _res) {
		var clientId = _req.session.loginData.clientId,
			cCommand = require('../modules/command.js'),
			myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "keyDelete", "progress": 100}]
				],
				"data": 
				{
					clientId: clientId
				}
			}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});
	}
}