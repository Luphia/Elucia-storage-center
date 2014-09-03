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
		try
		{
			checkToken(_data, function(rs, data)
			{
				switch(rs)
				{
					case 0:
						_data._result.message ="token does not exist";
						_data._result.result = 0;
						break;
					case 1:
						_data._result.message ="token is expired";
						_data._result.result = 0;
						break;
					case 2:
						_data._result.message ="generate token error(2)";
						_data._result.result = 0;
						break;
					case 3:
						_data._result.message ="generate token error(3)";
						_data._result.result = 0;
						break;
					case 4:
						_data._result.message ="token is valid";
						_data._result.result = 1;
						_data._result.data = data;
						break;
				}
				_callback(false, job);
			});
		}
		catch(e)
		{
			console.log(e);
			_callback(e);
		}	
	},

	checkToken = function(_data, _callback)
	{
		var date = parseInt(new Date().getTime()/1000),
			reqToken = _data.token;

		var cDb = require("../../modules/queryDB.js");
		var	sql = "select * from client_token where token = '" + reqToken + "' and status = 0;";
		db = new cDb();
		db.queryDB(sql, _data._config, function(err, result)
		{
			//傳送的token錯誤
			if(result.rowCount == 0)
			{
				_callback(0);
			}				
			else
			{
				var parseToken = require("../../modules/token").init(_data._config).decode(reqToken);
				var myToken = result.rows[0];

				//合法的 token
				if(myToken.client_id == parseToken.clientId && myToken.ip == parseToken.ip) {
					var rtdata = {
						"userid": myToken.client_id,
						"username": parseToken.username,
						"type": "Bearer",
						"expire": myToken.expire_time
					};
					if(date > myToken.expire_time) {
						_callback(1, rtdata);
					}
					else {
						_callback(4, rtdata);
					}
				}
				else {
					_callback(0);
				}
			}
		});
	},	

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}
