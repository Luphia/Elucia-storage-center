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
		var	date = parseInt(new Date().getTime()/1000),
			token = _data.token;

		var sql = "update client_token set expire_time = " + date + ",status = 1 where token = '" + token + "'";
		
		db = new require("../../modules/queryDB.js")();
		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
			{
				if(result.rowCount == 0)
				{
					_data._result.message ="there is no the token";
					_data._result.result = 0;
				}
				else
				{
					_data._result.message ="the token is deleted";
					_data._result.result = 1;
				}
			}
			else
			{
				_data._result.message ="token delete error";
				_data._result.result = 0;
			}
			
			_callback(false,job);
		});
	},


	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}