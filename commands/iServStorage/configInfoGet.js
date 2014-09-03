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
		_data._result.message ="get cofig success";
		_data._result.result = 1;
		_data._result.data = _data._config;

		_callBack(false,job);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;

}
