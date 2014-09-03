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
		var clientId = _data.clientId,
			type = _data.type,
			ip = _data.ip,
			content = _data.content;	


		sql = "insert into log_info(client_id,supplier_ip,type,content,create_time) "+
		      " values('"+clientId+"','"+ip+"',"+type+",'"+content+"',now());";	

		var cDb = require("../../modules/queryDB.js");
		db = new cDb();
		db.queryDB(sql, _data._config, function(err, result)	
		{
			if(!err)
			{
				_data._result.message ="insert ok";
				_data._result.result = 1;		
			}
			else
			{
				_data._result.message ="sql error";
				_data._result.result = 0;
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