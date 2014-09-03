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
		var config = require("../../config/config"),
			MF = require("../../modules/metadataFactory").init(config),
			fileName = _data.fileName,
			clientId = _data.clientId,
			myMeta;

		_data.sendPn++;
		
		// var sql = "select FP.file_path,FI.file_name from file_info FI,file_path FP where FI.client_id = "+clientId+" and FI.file_name = '"+filename+"'"+
		// 		  " and FI.status = 1 and FI.file_id = FP.file_id;";

		try
		{
			MF.load({"path": fileName}, clientId, function(_err, _meta) 
			{
	    		if(_err)
	    		{
	    			_data._result.message = "MF upload error";
					_data._result.result = 0;
    				console.log(_err);
	    		}
	    		else
	    		{
	    			myMeta = _meta;
	    			pathCount = myMeta.getReadyPath().length; 

	    			if(pathCount > 0)
	    			{
	    				selectIndex = (_data.sendPn % pathCount);   
	    				_data.fileCheck = true;
						_data.filePath = myMeta.getReadyPath(selectIndex).getValue("file_path");
	    			}
	    			else
	    			{
    					_data._result.message = "file does not exsit";
						_data._result.result = 0;
	    			}
	    		}
	    		_callback(false,job);
	    	}); 		

			// var cDb = require("../../modules/queryDB.js");
			// db = new cDb().queryDB(sql, _data._config, function(err, result)
			// {
			// 	if(!err && result.rows.length > 0)	
			// 	{
			// 		var selectIndex = (_data.sendPn % result.rows.length);
			// 		_data.rowCount = result.rowCount;
			// 		_data._result.result = 1;
			// 		_data.filePath = result.rows[selectIndex].file_path;
			// 		_data.dbFileName = result.rows[selectIndex].file_name;
			// 	}	
			// 	else
			// 	{
			// 		_data._result.message = "load file error";
			// 		_data._result.rowCount = 0;
			// 		_data._result.result = 1;
			// 	}
			// 	_callback(false, job);
			// });				
		}
		catch(e)
		{
			console.log(e);
			_data._result.message = "load file error";
			_data._result.rowCount = 0;
			_data._result.result = 0;
			_callback(false, job);
		}
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}