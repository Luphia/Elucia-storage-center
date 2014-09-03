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
		var fs   = require('fs'),
			util = require("util"),
			nconf = require('nconf'),
			util = require('util'),
			checkExist = "",
			pathDefault = "./config/config.default.json",
			path = "./config/config.json";	

		//check file exist
		checkExist = fs.existsSync(path);	
		if(!checkExist)
		{
			//copy default to new 
			var is = fs.createReadStream(pathDefault);
		    var os = fs.createWriteStream(path);
		    util.pump(is, os, function(err)
		    {
		        if(err)
		        {
		           console.log(err);
		           _data._result.result = 0;
				   _data._result.message = "update error";
		           _callBack(false,job);
		        }
		        else
		        {
		        	writeFile(_data,nconf,path,function()
					{
						_data._result.result = 1;
						_data._result.message = "update ok";
						_callBack(false,job);
					});	
		        }
		    });
		}	
		else
		{
			writeFile(_data,nconf,path,function()
			{
				_data._result.result = 1;
				_data._result.message = "update ok";
				_callBack(false,job);
			});	
		}
				
	},

	writeFile = function(_data,_nconf,_path,_callBack)
	{
		_nconf.argv().env().file({ file: _path });

		_nconf.set('expireTime',_data.tokenTime);
		_nconf.set('fileRepairPeriod', _data.fileRepair);
		_nconf.set('supplierMonitorPeriod', _data.sysMonitorPeriod);
  		_nconf.set('fileStrategy:replication', _data.fileReplication);

  		_nconf.save(function(err)
  		{
  			if(err)
  			{
  				console.log(err);
  			}
  				
  			_callBack();
  		});
	},

	that = 
	{
		init: init,
		writeFile:writeFile,
		execute: execute
	};

	return that;
}