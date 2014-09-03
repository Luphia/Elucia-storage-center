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

	get: function(_req, _res) 
	{
		var cmd = _req.params[0],
			rtdata = fileHealthy[cmd]();

		_res && _res.send(rtdata);
	},

	getFileList: function(_req, _res) {
		var rtdata = [],
			currNode = _req.headers['public-ip'] || _req.connection.remoteAddress;

		rtdata = fileHealthy.getNodeFileList(_req.node.url);

		_res && _res.send(rtdata);
	},

	nodeFileLost: function(_req, _res) {
		var rtdata = [],
			currNode = _req.headers['public-ip'] || _req.connection.remoteAddress;

		rtdata = fileHealthy.getNodeFileList(_req.node.url);

		_res && _res.send(rtdata);
	}
}