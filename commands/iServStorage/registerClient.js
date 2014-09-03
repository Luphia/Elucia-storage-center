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
		var cDb = require("../../modules/queryDB.js");
		db = new cDb();

		var sql = "select * from client_account where account = '"+_data.username+"'";

		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
			{
				_data.userRepeat = (result.rowCount > 0)? true : false;

				//insert client_info & client_account
				if(_data.userRepeat == false)
				{
					var sql = "insert into client_info(machine_number,machine_ip,machine_name,contact,status)"+
							  " values('"+_data.machineNumber+"','"+_data.machineIp+"','"+_data.machineName+"','"+JSON.stringify(_data.contact)+"',"+_data.status+") returning client_id;";
							
					db.queryDB(sql,_data._config,function(err,result)
					{
						if(!err)
						{
							var insertedClientId = result.rows[0].client_id;
							var sql = "insert into client_account(client_id,account,password) values("+insertedClientId+",'"+_data.username+"','"+_data.password+"')";		
							db.queryDB(sql,_data._config,function(err,result)
							{
								if(!err)
								{
									_data._result.message ="register success";
									_data._result.result = 1;
									_data._result.data = {"clientId": insertedClientId};																					
								}
								else
								{
									_data._result.message ="register error(3)";
									_data._result.result = 0;
								}
								_callback(false, job);	
							});				
						}
						else
						{
							_data._result.message ="register error(2)";
							_data._result.result = 0;

							_callback(false, job);								
						}					
					});					
				}	
				else
				{
					_data._result.message = "client repeat";
					_data._result.result = 1;
					_callback(false, job);		
				}			
			}
			else
			{
				_data._result.message ="register error(1)";
				_data._result.result = 0;
				_callback(false, job);		
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