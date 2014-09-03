module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data, _callback)
	{
		var filename = _data.filename,
			clientId = _data.clientId,
			tmpdata = {
				"client_id": clientId
			},
			metaFactory = require("../../modules/metadataFactory").init(_data._config),

		getResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callback(_err);
			}
			else if(_result) {
				_data._result.result = 1;
				_data._result.data = _result.rows;

				_callback(false, job);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "no such file";
				_callback(false, job);
			}
		};

		metaFactory.list(tmpdata, getResult);

	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}