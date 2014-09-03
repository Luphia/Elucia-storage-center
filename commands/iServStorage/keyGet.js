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
			var	sql = "select escrow_key from client_account where client_id = '" + _data.clientId + "'";

			var cDb = require("../../modules/queryDB.js");
			db = new cDb().queryDB(sql, _data._config, function(err,result)
			{
				if(!err)
				{
					//controller use	
					_data.effectNum = result.rowCount;

					if(result.rowCount == 1)
					{
						//check lohin success
						_data.check = true;

						//controller use
						_data._result.data = result.rows[0].escrow_key.length > 5? result.rows[0].escrow_key: "";
						_data._result.message ="get Key success";
						_data._result.result = 1;
					}
					else
					{
						_data.check = false;
						_data._result.message = "no such client";
						_data._result.result = 0;			
					}						
										
					_callback(false, job);				
				}	
				else
				{
					_data._result.message ="get Key error";
					_data._result.result = 0;
					_data._result.data.err = err;

					throw err;
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