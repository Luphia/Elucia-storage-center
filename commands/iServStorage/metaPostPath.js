module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data, _callBack)
	{
		if(!_data.supplierInfo || _data.supplierInfo.length == 0) {
			// no space(machine) to upload
			_data._result.message = "no space";
			_data._result.result = 0;
			_callBack(false, job);
			return false;
		}

		var metadata = _data.metadata,
			clientId = _data.clientId,
			metaFactory = require("../../modules/metadataFactory").init(_data._config),
			cRealpath = require("../../modules/realpath"),
			selectIndex = 0,
			maxIndex = _data.supplierInfo.length,

		getResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callBack(_err);
			}
			else if(_result) {
				var emptyFile;
				while(emptyFile = _result.getEmptyFile()) {

					var tmpSelection = selectIndex++ % maxIndex,
						currMachine = _data.supplierInfo[tmpSelection],
						tmpJSON = {
							"file_id": emptyFile.getId(),
							"file_path": "http://" + currMachine["machine_ip"] + "/file/" + emptyFile.generatePath(),
							"supplier_id": currMachine["supplier_id"],
							"machine_id": currMachine["machine_id"],
							"status": 0
						},
						currRealpath = new cRealpath(tmpJSON);

					emptyFile.addRealPath(currRealpath);
				}

				// metaFactory.save(_result, saveResult);
				_result.save(saveResult);

			}
			else {
				_data._result.result = 0;
				_data._result.message = "no such file";
				_callBack(false, job);
			}
		},
		saveResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callBack(_err);
			}
			else if(_result) {
				_data.selectsNum = _result.getEmptyPathCount();
				_data._result.result = 1;
				_data._result.data = _result.getUploadPath();
				_callBack(false, job);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "can not save metadata";
				_callBack(false, job);
			}
		};

		metaFactory.load(metadata, clientId, getResult);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}