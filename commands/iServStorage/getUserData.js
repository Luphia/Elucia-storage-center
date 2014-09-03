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
			var	sql = "select * from client_account where client_id = '" + _data.clientId + "'";

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
						_data.clientId = result.rows[0].client_id;
						_data.role = result.rows[0].role;
						_data.maxsize = result.rows[0].maxsize;
						_data.haskey = result.rows[0].haskey;
						_data.escrow = (result.rows[0].escrow_key.length > 5);

						_data._result.data = {
							"clientId": _data.clientId,
							"username": _data.user.username,
							"role": result.rows[0].role,
							"maxsize": result.rows[0].maxsize,
							"haskey": result.rows[0].haskey,
							"escrow": (result.rows[0].escrow_key.length > 5)
						};
						_data._result.message = "load config";
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
					_data._result.message ="DB Error";
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