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
			checkToken(_data,function(data)
			{
				switch(data)
				{
					case 1:
						_data._result.message ="there is no the token";
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
						_data._result.message ="token renew success";
						_data._result.result = 1;
						_data._result.data.token = _data.newtoken;
						break;
				}
				_callback(false,job);
			});
		}
		catch(e)
		{
			console.log(e);
			_callback(e);
		}	
	},

	checkToken = function(_data,_callback)
	{
		var tokenObj = require("../../modules/token").init(_data._config),
			date = parseInt(new Date().getTime()/1000),
			reqToken = _data.reqToken,
			decodeJson =  tokenObj.decode(reqToken),
			clientId = decodeJson.clientId,
			username = decodeJson.username;

			//for generateToken
			_data.clientId = clientId;
			_data.username = username;

		var cDb = require("../../modules/queryDB.js");
		db = new cDb();
		var	sql = "select status from client_token where token = '" + reqToken + "';";

		db.queryDB(sql,_data._config,function(err,result)
		{
			//傳送的token錯誤 or 傳送的token過期
			if(result.rowCount == 0 || result.rows[0].status == 1)
			{
				_callback(1);
			}				
			else
			{
				generateToken(_data,function(data)
				{
					_callback(data);
				});				
			}
		});
	},

	generateToken = function(_data,_callback)
	{
		var ip = _data.ip,
			date = parseInt(new Date().getTime()/1000),
			clientId = _data.clientId,
			crypto = require("../../modules/token").init(_data._config),
			token = crypto.encode(_data.username, _data.clientId, date, ip),
			expireTime = date + _data._config.expireTime;

		var cDb = require("../../modules/queryDB.js");
		db = new cDb();

		var	sql = "insert into client_token(client_id,token,ip,expire_time) "+
				  " values("+ clientId +",'"+ token +"','"+ ip +"',"+ expireTime +")";

		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
			{
				_data.newtoken = token;

				updateOldToken(_data,function(data)
				{
					_callback(4);
				});
			}
			else
				_callback(2);
		});
	},

	updateOldToken = function(_data,_callback)
	{
		var	date = parseInt(new Date().getTime()/1000),
			reqToken = _data.reqToken;

		var sql = "update client_token set expire_time = " + date + ",status = 1 where token = '" + reqToken + "'";

		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
				_callback(4);
			else
				_callback(3);
		});
	},
		

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}
