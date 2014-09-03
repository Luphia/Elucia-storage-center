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
		this.checkRepeat(_data,function(rs)
		{
			switch(rs)
			{
				case 0:
					_data._result.message ="register supplier ok";
					_data._result.result = 1;
					break;
				case 1:
					_data._result.message ="checkNameRepeat error";
					_data._result.result = 0;
					break;
				case 2:
					_data._result.message ="checkIpPortRepeat error";
					_data._result.result = 0;
					break;
				case 3:
					_data._result.message ="ip and port repeat";
					_data._result.result = 0;
					break;
				case 4:
					_data._result.message ="add Supplier Info error";
					_data._result.result = 0;
					break;
				case 5:
					_data._result.message ="add Supplier Usage error";
					_data._result.result = 0;
					break;
			}

			_callback(false, job);
		});
	},

	checkRepeat = function(_data, _callback)
	{
		checkNameRepeat = function(_data,_callback)
		{	
			var db = require("../../modules/queryDB.js")(),
			    sql = "select * from supplier_info where name = '"+_data.name+"'";

			console.log(sql);
			var rs = db.queryDB(sql,_data._config,function(err,result)
			{
				if(!err)
					_callback(result);
				else
					_callback(1);
			});

			return rs;
		}

		checkIpPortRepeat = function(_data,_callback)
		{
			var machineIp = _data.ip+":"+_data.port,
			    db = require("../../modules/queryDB.js")(),
			    sql = "select * from supplier_usage where machine_ip = '"+machineIp+"'";

			console.log(sql);
			db.queryDB(sql,_data._config,function(err,result)
			{
				if(!err)
				{
					if(result.rowCount > 0) 
						_callback(3);
					else
						_callback("not repeat");
				}					
				else
					 _callback(2);	
			});  
		}

		//check name first and then check ip+port
		checkNameRepeat(_data,function(result)
		{
			if(result == 1)
				_callback(result);
			else
			{
				checkIpPortRepeat(_data,function(resultIpPort)
				{
					if(resultIpPort == 2 || resultIpPort == 3)
						_callback(resultIpPort);
					else
					{
						//name repeat => add addSupplierUsage
						if(result.rowCount > 0)
						{
							_data.supplierId = result.rows[0].supplier_id;
							addSupplierUsage(_data,function(rs)
							{
								_callback(rs);
							});
						}	
						else //name not repeat => addSupplierInfo and add addSupplierUsage
						{
							addSupplierInfo(_data,function(rs)
							{	
								_callback(rs);
							});
						}
					}
				});				
			}
		});		
	},	

	addSupplierInfo = function(_data, _callback)
	{
		var nowtime = date = parseInt(new Date().getTime()/1000),
			db = require("../../modules/queryDB.js")(),
		    sql = "insert into supplier_info (name,register_time,contact)"+ 
		    	  " values ('"+_data.name+"','"+nowtime+"','"+_data.contact+"') returning supplier_id";

		console.log(sql);
		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
			{
				_data.supplierId = result.rows[0].supplier_id;	
				addSupplierUsage(_data,function(rs)
				{
					_callback(rs);
				});
			}
			else
				_callback(4);
		});
	},

	addSupplierUsage = function(_data, _callback)
	{
		var nowtime = date = parseInt(new Date().getTime()/1000),
			db = require("../../modules/queryDB.js")(),
		    sql = "insert into supplier_usage (supplier_id,status,total_space,usage_space,bandwith,update_time,machine_ip,machine_uid,client_id)"+ 
		    	  " values ("+_data.supplierId+",1,"+_data.totalSpace+",0,"+_data.bandwith+","+nowtime+",'"+_data.ip+":"+_data.port+"','"+_data.machineUId+"',"+_data.clientId+");";

		console.log(sql);
		db.queryDB(sql,_data._config,function(err,result)
		{
			if(!err)
				_callback(0);
			else
				_callback(5);
		});	
	},

	that = 
	{
		init: init,
		checkRepeat:checkRepeat,
		addSupplierInfo:addSupplierInfo,
		addSupplierUsage:addSupplierUsage,
		execute: execute
	};

	return that;
}