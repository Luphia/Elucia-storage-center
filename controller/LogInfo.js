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

	logInfoInsert : function(_req, _res)
	{
		var cCommand = require( '../modules/command.js' );
		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "logInfoInsert", "progress": "+50"}],		
			],
			"data": 
			{
				"ip": _req.headers['public-ip'] || _req.connection.remoteAddress,
				"type":_req.body.type,
				"content":_req.body.content,
				"clientId":_req.body.clientId
			}
		}, config);

		var cWorker = require("../roles/Worker");
		var worker = new cWorker().init(storage).assign(myCommand).execute(function() 
		{
			_res && _res.send(myCommand.getJobResult());
		});
	}
}