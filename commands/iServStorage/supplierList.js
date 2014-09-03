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
		var sql = "select SI.name,SU.id,SU.status,SU.machine_ip,SI.contact from supplier_info SI,supplier_usage SU "+
				  " where SU.supplier_id = SI.supplier_id;";
		
		var that = this;		  
		db = new require("../../modules/queryDB.js")();
		db.queryDB(sql,_data._config,function(err,result)
		{
			if(err)
			{
				console.log(err);
				_data._result.message ="get supplier error";
				_data._result.result = 0;
			}
			else
			{
				//use map api 
				//supplier google map use
				if(typeof _data.map != 'undefined')
				{
					var address = new require("../../modules/ipMap.js")();		
					for(var key in result.rows)
					{
						result.rows[key].address = address.getIpMapAddress(result.rows[key].machine_ip);
					}
				}
				else // not map api
				{
					//merge storage data
					for(var key in result.rows)
					{
						if(typeof _data.monitorData[result.rows[key].id] == "undefined")
							result.rows[key].status = 0;	
						else
							result.rows[key].status = _data.monitorData[result.rows[key].id].status;				
					}
				}

				_data._result.message ="get supplier ok";
				_data._result.result = 1;
				_data._result.data = result.rows;
			}

			_callback(false, job);
		});		
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}