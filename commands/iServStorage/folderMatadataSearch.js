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
		var fileName =	_data.fileName,
			sql = "select file_name,checkin_time,bytes,modified,md5,uuid,file_type from file_info "+
				  "where file_name like '%"+fileName+"%' and partof is null and status != 3 ";
		
		try
		{ 
			db = new require("../../modules/queryDB.js")();
			db.queryDB(sql,_data._config,function(err,result)
			{
				if(err)
				{
					console.log(err);
					_data._result.message ="get folderMatadataSearch error";
					_data._result.result = 0;
				}
				else
				{
					_data._result.message ="get folderMatadataSearch success";
					_data._result.result = 1;

					convertArray = [];
					if(result.rows.length > 0)
					{
						for(var key in result.rows)
						{
							//date
							date = (result.rows[key].modified == null)? result.rows[key].checkin_time : result.rows[key].modified;

							//set in array
							convertArray[key] = 
							{
								"name":result.rows[key].file_name,
								"type":result.rows[key].file_type,
								"size":result.rows[key].bytes,
								"date":date,
								"md5":result.rows[key].md5,
								"uuid":result.rows[key].uuid
							}
						}
					}			

					_data._result.data = {"files": convertArray};
				}

				_callback(false,job);
			});
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