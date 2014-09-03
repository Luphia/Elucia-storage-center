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
		if(typeof _data.monitorData == "undefined")
		{
			_data._result.result = 0;
			_data._result.message = "get supplierInfo error";
		}
		else
		{
			_data._result.result = 1;
			_data._result.message = "get supplierInfo ok";

			if(typeof _data.machineId == "undefined")
				_data._result.data = _data.monitorData;
			else
				_data._result.data = _data.monitorData[_data.machineId];
		}	

		_callback(false,job);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}