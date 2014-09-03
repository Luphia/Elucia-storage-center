/*
*	function module.queryDB
*	@input _sql
*	@input _config
*   @input _callBack
*/


module.exports =  function()
{
	queryDB = function(_sql, _config, _callBack)
	{
		var pg = require("pg"),
			conString = "pg://"+_config.db.user+":"+_config.db.password+"@"+_config.db.host+":"+_config.db.port+"/"+_config.db.database,
			client = new pg.Client(conString);

		client.connect(function(err, results) 
		{  
		     if(err)
		     {  
	            console.log('dbConnectReady Error: ' + err.message);  
	            client.end();

	            _callBack(err);
	            return;  
		     }  

		     // console.log("db connect OK");  
		});  

		client.query(_sql, function(err,results)
		{
			if(err)
			{
				client.end();
				console.log(err);
				_callBack(err);
			}
			else
			{
				client.end();
				_callBack(false,results);
			}			
		});	
	},

	that = 
	{
		queryDB: queryDB
	};
	return that;
};