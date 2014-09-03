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

	clientInfo : function(_req, _res)
	{
		var cResult = require("../modules/jobResult"),
			report = _req.body.report,
			rtdata = new cResult();
		if (typeof report == "undefined") {
			rtdata.setResult(0);
			rtdata.setMessage("report data format fail");
			_res.send(rtdata.toJSON());
		} 
		else if (typeof report.eval == "undefined"
			|| typeof report.ui == "undefined"
			|| typeof report.operate == "undefined" 
			|| typeof report.security == "undefined"
			|| typeof report.backup == "undefined"
			|| typeof report.checkbox == "undefined") {
			rtdata.setResult(0);
			rtdata.setMessage("report json format fail");
			_res.send(rtdata.toJSON());
		} 
		else {
			var cCommand = require( '../modules/command.js' );
			var myCommand = new cCommand().init(
			{
				"progress": 0,
				"todoList": 
				[
					[{"command": "clientInfo", "progress": 100}]
				],
				"data": 
				{
					"report": _req.body.report
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
}