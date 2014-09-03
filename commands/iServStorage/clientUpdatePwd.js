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
		getCientId(_data,function(rs)
		{
			switch(rs)
			{
				case -1:
					_data._result.message ="get clientId error";
					_data._result.result = 0;
					break;
				case -2:
					_data._result.message = "update client pwd error";
					_data._result.result = 0;
				case -3:
					_data._result.message = "password error";
					_data._result.result = 0;
					break;
				case 1:
					_data._result.message = "update client pwd ok";
					_data._result.result = 1;
					break;
			}

			_callback(false,job);
		});	
	},

	getCientId = function(_data,_callback)
	{
		var	token = _data.token,
			sql = "select client_id from client_token where token = '"+token+"'";

		var cDb = require("../../modules/queryDB.js"),
			db = new cDb().queryDB(sql,_data._config,function(err,result)
			{
				if(err)
				{
					_callback(-1);
				}	
				else
				{
					var clientId =  result.rows[0].client_id;

					updateClientPwd(_data,clientId,function(rs)
					{console.log("+++++++++++----------");
					console.log(rs);
						_callback(rs);	
					});	
				}
			});	
	},

	updateClientPwd = function(_data,_clientId,_callback)
	{
		checkOldPasswod(_data,_clientId,function(rs)
		{
			if(rs == 1)
			{
				var cDb = require("../../modules/queryDB.js"),
				sql = "update client_account set password = '"+_data.newPassword+"' where client_id = '"+_clientId+"' and password = '"+_data.oldPassword+"'";
				db = new cDb().queryDB(sql,_data._config,function(err,result)
				{
					if(err)
					{
						_callback(-2);
					}	
					else
					{
						_callback(1);	
					}
				});	
			}
			else
			{
				_callback(rs);
			}
		});	
	},

	checkOldPasswod = function(_data,_clientId,_callback)
	{
		var cDb = require("../../modules/queryDB.js"),
			selSql = "select client_id from client_account where client_id = '"+_clientId+"' and password = '"+_data.oldPassword+"'";
			console.log(selSql);
			db = new cDb().queryDB(selSql,_data._config,function(err,result)
			{
				if(err)
				{
					_callback(-3);
				}	
				else
				{
					if(result.rowCount == 0)
					{
						_callback(-3);
					}
					else
					{
						_callback(1);
					}					
				}
			});	
	},

	that = 
	{
		init: init,
		execute: execute,
		getCientId:getCientId,
		checkOldPasswod:checkOldPasswod,
		updateClientPwd:updateClientPwd
	};

	return that;
}