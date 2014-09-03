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
			newName = _data.newName,
			clientId = _data.clientId,
			metaFactory = require("../../modules/metadataFactory").init(_data._config);

		metadata.path = _data.path; // necessary for metaFactory.load(metadata, clientId, checkResult);	

		try
		{
			checkResult = function(_err, _result) {
				if(_err) {
					_data._result.message = _err.message;
					_callback(_err);
				}
				else if(_result && _result.isNew()) {
					metaFactory.save(_result, saveResult);
					_data._result.data = _result.toJSON();
				}
				else if(_result) {
					// if exist and input different value -> update metadata
					(typeof(newName) == "string") && (newName.trim().length > 0) && (metadata.file_name = newName); // file_name must contain path and name
					_result.update(metadata); // update function from modules\metadata.js
					metaFactory.save(_result, saveResult);
					_data._result.data = _result.toJSON();
				}
				else {
					_data._result.result = 0;
					_data._result.message = "can not save metadata";
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
					_data._result.data = _result.getUploadPath();
	
					_callback(false, job);
				}
				else {
					_data._result.result = 0;
					_data._result.message = "can not save metadata";
					_callback(false, job);
				}
			};

			metaFactory.load(metadata, clientId, checkResult);
		}
		catch(e) {
			console.log(e);
			_callback(e);
		}
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}