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
		var totalDisk = 0,
			diskUsage = 0,
			sql;

		//totalDisk & totalRam
		for(var key in _data.monitorData)
		{	
			if(_data.monitorData[key].status == 1)
			{
				totalDisk += _data.monitorData[key].disk.total;
				diskUsage += _data.monitorData[key].disk.loading;
			}			
		}

		//avalibility
		sql = "select fi.file_name, fi.client_id, count(distinct fp.file_path) as count "+
			  " from file_info fi left join file_path fp on fi.file_id = fp.file_id"+
			  " where fi.type = 1 and fi.isdir = false and fi.status = 1 and fp.status = 1"+
			  " group by fi.file_name, fi.client_id";

		var cDb = require("../../modules/queryDB.js"),
			db = new cDb().queryDB(sql,_data._config,function(err,result)
			{
				if(err)
				{
					_data._result.result = 0;
					_data._result.message = "get avalibility error";
				}
				else
				{
					//分散台數
					var replication = _data._config.fileStrategy.replication,
						count = 0;

					for(var key in result.rows)
					{
						if(result.rows[key].count >= replication)						
							count++;						
						else
							count += result.rows[key].count/replication;
					}

					_data._result.result = 1;
					_data._result.message = "get totalInfo ok";
					_data._result.data.totalDisk = totalDisk;
					_data._result.data.diskUsage = diskUsage;
					_data._result.data.avalibility = Math.round(count/result.rowCount*100);			
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