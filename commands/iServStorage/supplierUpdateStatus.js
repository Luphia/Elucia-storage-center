module.exports = function() {
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},
 
	execute = function(_data, _callback)
	{
		var statsu;
		if(_data.status)
			status = 1;
		else
			status = 0;

		var	ip = _data.ip;

		var str = "update supplier_usage set status = "+status+" where machine_ip = '"+ip+"'";

		var db = new require("../../modules/queryDB.js")();	
		db.queryDB(str, _data._config, function(__err, __result) 
		{
			if(__err) 
			{
				_data._result.result = 0;
				_data._result.message = "update supplier status failed";
				
			}
			else 
			{
				_data._result.result = 1;
				_data._result.message = "update supplier status ok";
			}

			_callback(false, job);
		});
	},

	that = {
		init: init,
		execute: execute
	};
	return that;
}