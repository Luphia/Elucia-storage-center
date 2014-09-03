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
		_data._result.data = {};
		if(!_data.supplierInfo || _data.supplierInfo.length == 0) {
			// no space(machine) to upload
			_data._result.message = "no space";
			_data._result.result = 0;
			_callBack(false, job);
			return false;
		}

		var metadata = _data.meta? _data.meta: _data.path,
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
				// file is ready
				if(_data._result.data = _result.getDuplicationPath()) {
					var realpathList = _result.getRealPath(),
						duplicationNum = _result.getValue("replication"),
						existPaths = [],
						candidates = [];

					if(realpathList.length < duplicationNum) {
						for(var key in realpathList) {
							existPaths.push(realpathList[key].getValue("file_path"));
						}

						// 建立候選路徑
						for(var key in _data.supplierInfo) {
							var tmpPath = "http://" + _data.supplierInfo[key]["machine_ip"] + "/file/" + _result.generatePath();
							if(existPaths.indexOf(tmpPath) == -1) {
								existPaths.push(tmpPath);

								var tmpJSON = {
										"file_id": _result.getId(),
										"file_path": tmpPath,
										"supplier_id": _data.supplierInfo[key]["supplier_id"],
										"machine_id": _data.supplierInfo[key]["machine_id"],
										"status": 0
									},
									currRealpath = new cRealpath(tmpJSON);

								candidates.push(currRealpath);
							}
						}

						// 代入複製路徑
						for(var i = realpathList.length; i < duplicationNum && candidates.length > 0; i++) {
							_result.addRealPath(candidates[0]);
							candidates.splice(0, 1);
						}

						_result.save(saveResult);
					}
					else {
						_data._result.result = 1;
						_data._result.message = "get duplicate detail success";
						_callBack(false, job);
					}
				}
				// file is not ready
				else {
					_data._result.result = 0;
					_data._result.message = "file has not upload";
					_callBack(false, job);
				}
			}
			else {
				_data._result.result = 0;
				_data._result.message = "file not found";
				_callBack(false, job);
			}
		},
		saveResult = function(_err, _result) {
			if(_err) {
				_data._result.message = _err.message;
				_callBack(_err);
			}
			else if(_result) {
				_data._result.result = 1;
				_data._result.data = _result.getDuplicationPath();
				_data._result.message = "get duplicate detail success";
				_callBack(false, job);
			}
			else {
				_data._result.result = 0;
				_data._result.message = "can not save realpath";
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