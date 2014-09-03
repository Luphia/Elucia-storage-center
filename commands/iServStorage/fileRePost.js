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
		if(_data.notUpload)
		{	
			var machineIp = _data.supplierInfo.machine_ip;
			var request = require('request-json');
			var client = request.newClient("http://"+machineIp);

			try
			{
				client.headers.authorization = _data.authorization;
				client.sendFile("/file/"+_data.realpath, _data.files[0].path, {}, function(err, res, body) 
				{
				  	if(err) 
				  	{		  		
				    	console.log(err);
				    	
				  	}

				  	_callBack(false,job);
				});	
			}
			catch(e)
			{
				_callBack(false,job);
			}
					
		}	
		else
			_callBack(false,job);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}