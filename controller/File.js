var commands,
	storage,
	config,
	fileHealthy;

module.exports = 
{
	init: function(_commands, _storage, _config)
	{
		commands = _commands;
		storage = _storage;
		config = _config;

		_storage.post("provisionNum", 0);
		_storage.post("sendNum", 0);

		return this;
	},

	setFileHealthy: function(_fileHealthy) 
	{
		fileHealthy = _fileHealthy;
	},

	fileUpload: function(_req, _res)
	{
		var file, hasFile = false,filesArray = [];
		for(var key in _req.files) 
		{
			file = _req.files[key];
			hasFile = true;
			filesArray.push(file);
		}

		var cCommand = require( '../modules/command.js' );

		//command set
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": ":read:storeKey:dataKey", "progress": "+10"}],//data key => pn & storage key => provisionNum
				[{"command": "smartProvision", "progress": "+20"}],	
				[{"command": "fileUpload", "progress": "+30"}],
				[{"command": ":write:storeKey:dataKey", "progress": "+10"}],
				[{"command": "fileCheckBrowser", "progress": "+15"}],
				[{"command": "fileRePost", "progress": "+15"}]	
			],
			"data": 
			{
				"filename": _req.params[0],
				"file": file,
				"clientId": _req.session.loginData.clientId,
				"storeKey": "provisionNum",
				"dataKey": "pn",
				"userAgent":_req.headers['user-agent'],
				"authorization":_req.headers['authorization'],
				"files":filesArray
			}
		}, config);

		commands.post(myCommand);
		if(!hasFile) {
			rtdata = require( '../modules/jobResult.js' )();
			rtdata.setMessage("There is no uploaded file");
			_res && _res.send(JSON.stringify(rtdata));

			return false;
		}
 
		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			var rtdata = myCommand.getData();

			resultdata = myCommand.getJobResult();
		
			//物件無屬性時直接回應不轉發307
			if(resultdata.result == 1 && resultdata.data.hasOwnProperty())
			{
				_res.writeHead(307,
			    {
			        "Location": "http://" + rtdata.supplierInfo.machine_ip + "/file/" + rtdata.filename
			    });
	   		 	_res.end();
			}
			else
			{
				_res && _res.send(resultdata);
			}			
		});	
	},

	fileDownload: function(_req,_res)
	{
		var fileName = _req.params[0],
			clientId =  _req.session.loginData.clientId;

		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": ":read:storeKey:dataKey", "progress": "+10"}],//data key => pn & storage key => provisionNum
				[{"command": "fileDownload", "progress": "+80"}],	
				[{"command": ":write:storeKey:dataKey", "progress": "+10"}]	
			],
			"data": 
			{
				"fileName": fileName,
				"clientId": clientId,
				"storeKey": "sendNum",
				"dataKey": "sendPn"
			}
		}, config);

		//send command
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{	
			_data = myCommand.getOutput();

			if(_data.data.fileCheck)
			{
				_res.writeHead(307,
			    {
			    	//command set data & controller get path
			        "Location": _data.data.filePath
			    });   		 
			}
			else
			{
				_res.writeHead(404);
			    _res.write(myCommand.getJobResult().message); 
			}
			
			_res.end();
		});	 
	},

	fileDelete: function(_req, _res)
	{
		var fileName = _req.params[0];
		var clientId =  _req.session.loginData.clientId;


		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "fileDelete", "progress": "+50"}]	
			],
			"data": 
			{
				"fileName": fileName,
				"clientId": clientId
			}
		}, config);
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{			
			_res && _res.send(myCommand.getJobResult());
			fileHealthy.removeFile({
				"client": parseInt(clientId),
				"url": path
			});
		});	
	},

	checkFileAuth: function(_req,_res) 
	{
		if(!_req.body.action) {
			_req.body.action = {};
		}

		var token = _req.body.token,
			type = _req.body.action.type,
			path = _req.body.action.path,
			method = _req.body.action.method,
			rtdata = {};

		var cCommand = require('../modules/command.js');

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "tokenCheck", "progress": "+50"}],	
				[{"command": "checkFileAuth", "progress": "+50"}]	
			],
			"data": 
			{
				"token":token,
				"method":method,
				"path":path,
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			rtdata = myCommand.getOutput();
			_res && _res.send(myCommand.getJobResult());
		});

	},

	fileUploadConfirm: function(_req, _res)
	{
		var fileName = _req.params[0],
			clientId = _req.body.clientId,
			md5 = _req.body.md5,
			fileType = _req.body.fileType,		
			bytes = _req.body.bytes;

		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "fileUploadConfirm", "progress": "+50"}],
				[{"command": "fileUploadConfirmLog", "progress": "+50"}]	
			],
			"data": 
			{
				"fileName": fileName,
				"md5": md5,
				"clientId": clientId,
				"bytes": bytes,
				"fileType": fileType,
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress
			}
		}, config);
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			var rtdata = myCommand.getJobResult();
			_res && _res.send(rtdata);
			fileHealthy.addPath(clientId, rtdata.data.path, rtdata.data.detail);
		});		
	},

	folderMatadata: function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "folderMatadata", "progress": 50}]
			],
			"data": 
			{
				"fileName":_req.params[0],
				"clientId": _req.session.loginData.clientId
			}
		}, config);

		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{			
			_res && _res.send(myCommand.getJobResult());
		});		
	},

	folderMatadataSearch: function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "folderMatadataSearch", "progress": 50}]
			],
			"data": 
			{
				"fileName":_req.params[0],
				"clientId": _req.session.loginData.clientId
			}
		}, config);

		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{			
			_res && _res.send(myCommand.getJobResult());
		});		
	},

	//新建 metadata，需檢查是否已存在
	metaPost: function(_req, _res) {
		var clientId =  _req.session.loginData.clientId	
		,	path = _req.params[0]	
		,	cCommand = require( '../modules/command.js' )
		;

		_req.body.path = path;

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "metaPost", "progress": 20}],
				[{"command": ":continue:check", "progress": 20}],
				[{"command": ":read:storeKey:dataKey", "progress": "+10"}], //data key => pn & storage key => provisionNum
				[{"command": "smartProvision", "progress": "+20"}],
				[{"command": ":write:storeKey:dataKey", "progress": "+10"}],
				[{"command": "metaPostPath", "progress": 100}]
			],
			"data": 
			{
				"clientId": clientId,
				"metadata": _req.body,
				"storeKey": "provisionNum",
				"dataKey": "pn",
				"pn": 0,
				"check": true
			}
		}, config);
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{			
			_res && _res.send(myCommand.getJobResult());
		});
	},

	//查詢 metadata
	metaGet: function(_req, _res) {
		var clientId = _req.session.loginData.clientId
		,	path = _req.params[0]
		,	cCommand = require( '../modules/command.js' )
		;
		
		if(path.length - 1 == path.lastIndexOf("/")) {
			var myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "folderMatadata", "progress": 100}]
				],
				"data": 
				{
					"clientId": clientId,
					"fileName": path
				}
			}, config);
		}
		else {
			var myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "metaGet", "progress": 100}]
				],
				"data": 
				{
					"clientId": clientId,
					"filename": path
				}
			}, config);
		}
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			_res && _res.send(myCommand.getJobResult());
		});	
	},

	//修改或新建 metadata
	metaPut: function(_req, _res) {
		var clientId =  _req.session.loginData.clientId,	
			path = _req.params[0], // http put url	
			cCommand = require( '../modules/command.js' );

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "metaPut", "progress": 100}],
				[{"command": ":continue:check", "progress": 20}],
				[{"command": ":read:storeKey:dataKey", "progress": "+10"}], //data key => pn & storage key => provisionNum
				[{"command": "smartProvision", "progress": "+20"}],
				[{"command": ":write:storeKey:dataKey", "progress": "+10"}],
				[{"command": "metaPostPath", "progress": 100}]
			],
			"data": 
			{
				"clientId": clientId,
				"metadata": _req.body,
				"path": path, // url
				"newName": _req.body.newName,
				"storeKey": "provisionNum",
				"dataKey": "pn",
				"pn": 0,
				"check": true
			}
		}, config);
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{			
			_res && _res.send(myCommand.getJobResult());
		});
	},

	//刪除 metadata，將連帶刪除相關檔案
	metaDelete: function(_req, _res) {
		var clientId = _req.session.loginData.clientId
		,	path = _req.params[0]
		,	cCommand = require( '../modules/command.js' )
		;
		
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "metaDelete", "progress": 100}]
			],
			"data": 
			{
				"clientId": clientId,
				"filename": path
			}
		}, config);
		
		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			_res && _res.send(myCommand.getJobResult());
			fileHealthy.removeFile({
				"client": parseInt(clientId),
				"url": path
			});
		});	
	},
	metaList: function(_req, _res) {
		var clientId = _req.session.loginData.clientId
		,	cCommand = require( '../modules/command.js' )
		;

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "metaList", "progress": 100}]
			],
			"data": 
			{
				"clientId": clientId
			}
		}, config);

		commands.post(myCommand);

		//commands post to work & worker assign & execute
		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function()
		{
			_res && _res.send(myCommand.getJobResult());
		});
	}
}