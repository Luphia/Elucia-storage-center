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
		//token check ok
		if(_data._result.result == 1)
		{
			var clientId = _data._result.data.userid,
				fileName = _data.path,
				ip = _data.ip,
				method = _data.method;
			
			var sql = "select FI.md5 from file_info FI,file_path FP "+
					  "	where FI.client_id = "+ clientId +" and FP.file_path like '%"+ip+"%/file/"+fileName+"'"+
				  	  " and FI.file_id = FP.file_id";			

			switch(method)
			{
				case "get":
					sql += " and FP.status = 1 ";
					break;
				case "post":
					sql += " and FP.status = 0 ";
					break;
				case "put":				
					sql += " and (FP.status = 0 or FP.status = 1) ";
					break;
			}
console.log(this.logger.warn(sql));
			var cDb = require("../../modules/queryDB.js");
			db = new cDb();
			db.queryDB(sql, _data._config, function(err, result)	
			{
				if(!err)
				{
					if(result.rowCount == 1)
					{
						_data._result.message ="check ok";
						_data._result.result = 1;
						_data._result.data.md5 = result.rows[0].md5;
					}
					else
					{
						_data._result.message ="no file";
						_data._result.result = 1;
					}					
				}
				else
				{
					_data._result.message ="sql error";
					_data._result.result = 0;
				}

				_callback(false, job);
			});  
		}
		else 
		{
			_data._result.message ="check error";
			_data._result.result = 0;
			_data._result.data = "";
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