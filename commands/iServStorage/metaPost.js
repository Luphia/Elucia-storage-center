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
		_data.selectsNum = 0;

		var metadata = _data.metadata,
			clientId = _data.clientId,
			metaFactory = require("../../modules/metadataFactory").init(_data._config),

		checkResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callback(_err);
			}
			else if(_result && _result.isNew()) {
				metaFactory.save(_result, saveResult);
				_data._result.data = _result.toJSON();
			}
			else {
				_data.selectsNum = _result.getEmptyPathCount();
				_data._result.result = 0;
				_data.check = false;
				_data._result.message = "metadata already exist";
				_callback(false, job);
			}
		},
		saveResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callback(_err);
			}
			else if(_result) {
				_data.selectsNum = _result.getEmptyPathCount();
				_data.check = (_data.selectsNum > 0);
				_data._result.result = 1;
				_data._result.data = _result.toJSON();

				_callback(false, job);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "can not save metadata";
				_data.check = false;
				_callback(false, job);
			}
		};

		metaFactory.load(metadata, clientId, checkResult);

	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}