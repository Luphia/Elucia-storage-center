
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
			var token = _data.token,
				date = parseInt(new Date().getTime()/1000);

			try
			{
				var sql = "update client_token set expire_time = " + date + ",status = 1 where token = '" + token + "'";

				var cDb = require("../../modules/queryDB.js");
				db = new cDb().queryDB(sql,_data._config,function(err,result)
				{				
					if(!err)	
					{
						_data._result.message ="logout success";
						_data._result.result = 1;
					}	
					else
					{
						_data._result.message ="logout error";
						_data._result.result = 0;
					}			
					_callback(false, job);				
				});						
			}
			catch(e)
			{
				_data._result.message ="logout error";
				_data._result.result = 0;
				
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