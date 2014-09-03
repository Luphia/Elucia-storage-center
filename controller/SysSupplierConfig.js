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

	storageConfig: function(_req, _res) {
		var cResult = require("../modules/jobResult"),
			rtdata = new cResult();

		rtdata.setResult(1);
		rtdata.setData({"fileStrategy": config.fileStrategy});
		_res && _res.send(rtdata);
	}
}