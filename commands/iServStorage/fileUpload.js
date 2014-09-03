module.exports = function()
{
	var job
	,	myCallBack = function() {}
	,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data, _callBack)
	{
		myCallBack = _callBack;
		fileUpload(_data, _callBack);
	},

	/*******below private*******/
	fileUpload = function(_data, _callBack)
	{
		var config = require("../../config/config"),
			cRealpath = require("../../modules/realpath"),
			MF = require("../../modules/metadataFactory").init(config),
			file = require("../../modules/file"),
			myMeta, myRealpath,
			postFile = _data.file;

		try
		{
			if(_data.filename.length == 0)
			{
				_data._result.message = "filename is null";
				_data._result.result = 0;
				_callBack(false, job);
			}
			else if(!_data.supplierInfo)
			{
				// no space(machine) to upload
				_data._result.message = "no space";
				_data._result.result = 0;
				_callBack(false, job);
			}
			else
			{
				var after = function(_err, _md5)
				{
					clientId = _data.clientId;
					path = _data.filename;
					var realpath;

					MF.load({"path": path, "bytes":postFile.size, "md5": _md5}, clientId, function(_err, _meta) 
	           		{	
	           			if(_err) 
	           			{
	           				console.log(_err);
	           				_data._result.message = "file upload error";
							_data._result.result = 0;
							_callBack(false, job);
	           			} 
	           			else 
	           			{
	           				myMeta = _meta; 
	           				machineIp = _data.supplierInfo.machine_ip;
	           				supplierId = _data.supplierInfo.supplier_id;
	           				machineId = _data.supplierInfo.machine_id;
	           				realpath = myMeta.generatePath();

	           				myRealpath = new cRealpath({"file_path": "http://" + machineIp+"/file/"+realpath, "supplier_id": supplierId, "machine_id": machineId, "status": 0});	           			
	           				myMeta.addRealPath(myRealpath);
							MF.save(myMeta, function(_err) 
							{
								if(_err) 
								{
									_data._result.message = "file upload error";
									_data._result.result = 0;
									_callBack(_err);
								}
								else 
								{
									_data.realpath = myMeta.generatePath();
									_data._result.message = "file upload success";
									_data._result.result = 1;
									_callBack(false, job);
								}
							});
	           			}	           			
	           		});
			    }

				file.md5(postFile, after);
			}		
		}
		catch(e)
		{
			_callBack(e);	
		}		
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}