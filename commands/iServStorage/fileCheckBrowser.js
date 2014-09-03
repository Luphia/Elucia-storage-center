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
		_data.notUpload = false;

		if(typeof _data.userAgent != "undefined")
		{
			_data.notUpload = true;
		}
		
		_callBack(false,job);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}