


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
			if(_data.effectNum == 1)
			{
				var ip = _data.ip,
				clientId = _data.clientId;
				date = parseInt(new Date().getTime()/1000),
				crypto = require("../../modules/token").init(_data._config),
				token = crypto.encode(_data.username, _data.clientId, date, ip),
				expireTime = date + _data._config.expireTime;

				var	sql = "insert into client_token(client_id,token,ip,expire_time) "+
						  " values("+ clientId +",'"+ token +"','"+ ip +"',"+ expireTime +")";

				var cDb = require("../../modules/queryDB.js");

				// 檢查是否已存在該token
				var sql2 = "select * from client_token where token = '" + token + "'";
				db = new cDb().queryDB(sql2,_data._config,function(_err, _result) {
					if(!_err && _result.rowCount > 0) {
						_data._result.data = {
							"clientId": _data.clientId,
							"username": _data.username,
							"role": _data.role,
							"token": token,
							"type": "Bearer",
							"expireTime": expireTime,
							"maxsize": _data.maxsize,
							"haskey": _data.haskey,
							"escrow": _data.escrow
						};

						_callback(false, job);
					}
					else {
						db = new cDb().queryDB(sql,_data._config,function(err,result)
						{
							if(!err)	
							{		
								//controller use
								_data._result.data = {
									"clientId": _data.clientId,
									"username": _data.username,
									"role": _data.role,
									"token": token,	
									"type": "Bearer",	
									"expireTime": expireTime,
									"maxsize": _data.maxsize,
									"haskey": _data.haskey,
									"escrow": _data.escrow
								};
							}
							else
							{
								_data._result.message ="generate token error";
								_data._result.result = 0;
								_data._result.data.err = err;
							}

							_callback(false, job);
						});
					}
				});
			}
		}
		catch(e)
		{
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
