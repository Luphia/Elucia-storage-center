module.exports = function() {
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