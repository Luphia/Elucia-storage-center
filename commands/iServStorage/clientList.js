module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data, _callBack)
	{
		clientId = _data.clientId;

		sql = "select machine_number,machine_ip,machine_name,contact,status from client_account CA,client_info CI "+
			  "where CA.client_id = CI.client_id and CA.client_id = '"+clientId+"'";

		db = new require("../../modules/queryDB.js")();
		db.queryDB(sql,_data._config,function(err,result)
		{
			if(err)
			{
				console.log(err);
				_data._result.message ="get client error";
				_data._result.result = 0;
			}	
			else		
			{
				_data._result.message ="get client success";
				_data._result.result = 1;
				_data._result.data = result.rows;
			}
			_callBack(false,job);
		});	
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}