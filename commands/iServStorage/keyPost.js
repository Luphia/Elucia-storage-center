/*
*	function module.execute
*	@output data.contents = [] 
*/


module.exports = function(){
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},
 
	execute = function(_data, _callback)
	{
		try 
		{
			var	sql = "update client_account set escrow_key = '" + _data.escrowKey + "' where client_id = '" + _data.clientId + "' and haskey = true";

			var cDb = require("../../modules/queryDB.js");
			db = new cDb().queryDB(sql, _data._config, function(err, result)
			{
				if(!err && result.rowCount > 0)
				{		
					_data._result.message ="escrow Key success";
					_data._result.result = 1;
										
					_callback(false, job);
				}	
				else
				{
					_data._result.message ="escrow Key error";
					_data._result.result = 0;
					_data._result.data.err = err;

					_callback(false, job);
				}						
			});
		}
		catch(e) 
		{
			_callback(e);
		}

	},

	that = {
		init: init,
		execute: execute
	};
	return that;
}