var commands,
	storage,
	config,
	fileHealthy;

module.exports = 
{
	init : function(_commands, _storage, _config, _fileHealthy)
	{
		!!_commands && (commands = _commands);
		!!_storage && (storage = _storage);
		!!_config && (config = _config);
		!!_fileHealthy && (fileHealthy = _fileHealthy);

		return this;
	},

	nodeRiskGet  : function(_req,_res) 
	{
		var cCommand = require('../modules/command.js');

		var myCommand = new cCommand().init(
		{
			"progress": 0,
			"todoList": 
			[
				[{"command": "nodeRiskGet", "progress": "+50"}]
			],
			"data": 
			{
				"fileHealthy": fileHealthy.getNodeRisk(),
				"monitorData": storage.get("supplierMonitorData"),
				"summaryData": fileHealthy.getSummary()
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