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
		try
		{
			for(var key in _data.fileList) {
				var tmpFile = _data.fileList[key],
					rest = new require("../../modules/restRequest.js")();

				rest.get({	"host": tmpFile.fullpath,
							"data": {},
							"callBack": {
								"success": function(__data) {
									var result = JSON.parse(__data);
									console.log("repair file: " + result.data.client_id + "/" + result.data.partition_file_path);
								}
						}
				});
			}

			_callback(false, job);
		}
		catch(e)
		{
			console.log(e);
			_callback(e);
		}	
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}
