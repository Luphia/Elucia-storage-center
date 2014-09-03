/*
* get clientid first 
* and get usage bytes through clientId
*/

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
		getCientId(_data,function(rs,data)
		{
			switch(rs)
			{
				case -1:
					_data._result.message ="get clientId error";
					_data._result.result = 0;
					break;
				case -2:
					_data._result.message ="get disk usage error";
					_data._result.result = 0;
				case 1:
					_data._result.message ="get disk usage ok";
					_data._result.result = 1;
					_data._result.data = data;
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
					var clientId =  result.rows[0].client_id,
						i = 0,
						rsData = {};

					finish = function()
					{
						if(i == 2)
						{
							_callback(1,rsData);
						}
					};

					getDiskUsage(_data,clientId,function(rs,data)
					{
						i++;

						if(rs == -2)
						{
							_callback(rs);
						}
						else
						{
							rsData.bytes = parseInt(data);
							finish();
						}					
					});

					getMaxsize(_data,clientId,function(rs,data)
					{
						i++;

						if(rs == -3)
						{
							_callback(rs);
						}
						else
						{
							rsData.maxsize = parseInt(data);
							finish();
						}					
					});				
				}
			});	
	},

	getMaxsize = function(_data,_clientId,_callback)
	{
		var sql = "select maxsize from client_account where client_id = '"+_clientId+"'";

		var cDb = require("../../modules/queryDB.js"),
			db = new cDb().queryDB(sql,_data._config,function(err,result)
			{
				if(err)
				{
					_callback(-3);
				}	
				else
				{		
					_callback(1,result.rows[0].maxsize);
				}
			});	
	},

	getDiskUsage = function(_data,_clientId,_callback)
	{
		var folderName = _data.folderName,
			sql = "select sum(bytes) as bytes from file_info where type= 1 and client_id = '"+_clientId+"'";

		if(typeof folderName != "undefined")
		{
			sql += " and file_name like '"+folderName+"%'";
		}

		var cDb = require("../../modules/queryDB.js"),
			db = new cDb().queryDB(sql,_data._config,function(err,result)
			{
				if(err)
				{
					_callback(-2);
				}	
				else
				{
					_callback(1,result.rows[0].bytes);
				}
			});	
	},

	that = 
	{
		init: init,
		getCientId:getCientId,
		getDiskUsage:getDiskUsage,
		execute: execute
	};

	return that;
}