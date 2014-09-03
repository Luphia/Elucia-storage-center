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

		var filename = _data.filename,
			clientId = _data.clientId,
			tmpdata = {
				"path": _data.filename
			},
			metaFactory = require("../../modules/metadataFactory").init(_data._config),

		checkResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callback(_err);
			}
			else if(_result && !_result.isNew() && _result.isDir()) {
				// if is empty dir -> delete; else -> return false
				var db = new require("../../modules/queryDB.js")();
				sql = "select file_name,checkin_time,bytes,modified,md5,uuid,file_type from file_info "+
					  "where file_name like '"+filename+"%' and file_name not like '"+filename+"%/%' and file_name != '"+filename+"' and partof is null and status != 3 and client_id = "+ clientId +" "+
					  "union "+ 
					  "select file_name,checkin_time,bytes,modified,md5,uuid,file_type from file_info "+
					  "where file_name like '"+filename+"%/' and file_name not like '"+filename+"%/%/' and partof is null and status != 3 and client_id = "+ clientId +";";

				db.queryDB(sql, _data._config, function(__err, __result) {
					if(__err) {
						_data._result.result = 0;
						_data._result.message = "delete folder failed";
						_callback(false, job);
					}
					else if(__result.rowCount > 0) {
						_data._result.result = 0;
						_data._result.message = "cannot delete this folder with files in it";
						_callback(false, job);
					}
					else {
						_result.setStatus(3);
						metaFactory.save(_result, saveResult);
					}
				});
			}
			else if(_result && !_result.isNew()) {
				_result.setStatus(3);
				metaFactory.save(_result, saveResult);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "no such file";
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
				_data._result.result = 1;

				_callback(false, job);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "can not delete metadata";
				_callback(false, job);
			}
		};

		metaFactory.load(tmpdata, clientId, checkResult);

	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}