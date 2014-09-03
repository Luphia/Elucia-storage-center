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
		console.log("------------------------------file upload confirm log---------------------------------");
		var config = require("../../config/config"),
		    MF = require("../../modules/metadataFactory").init(config),
			fileName = _data.fileName,	
			clientId = _data.clientId,
			ip = _data.ip;

		MF.load({"realpath": fileName, "isRealpath": true}, clientId, function(_err, _meta) 
		{
			//mata 資料存到 log_info
			sql = "insert into log_info(client_id,supplier_ip,type,content,create_time) "+
	      		  " values('"+clientId+"','"+ip+"',"+"3"+",'[file upload confirm] "+JSON.stringify(_meta.toJSON(true))+"',now());";	

			var cDb = require("../../modules/queryDB.js");
			db = new cDb();
			db.queryDB(sql, _data._config, function(err, result)	
			{
				if(!err)
				{
					console.log("-------------file upload confirm log insert log ok-----------");
					// _data._result.result = 1;		
				}
				else
				{
					console.log("-----------file upload confirm log insert log error--------------");
					// _data._result.result = 0;
				}

				_callback(false, job);
			});  	
		});
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}