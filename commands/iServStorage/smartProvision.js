module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data,_callBack)
	{
		try
		{
			var sql = "select SU.machine_ip,SU.id machine_id,SU.supplier_id,SU.total_space,SU.bandwith,SU.usage_space from supplier_info SI,supplier_usage SU "+
				  	  "where SI.supplier_id= SU.supplier_id and SU.status = 1";

			if(typeof _data.selectsNum != "undefined")
				sql += " and SU.machine_ip not like '"+_data.ip+"%'";

			var cDb = require("../../modules/queryDB.js");
			db = new cDb().queryDB(sql,_data._config,function(err, result)
			{
				if(!err && result.rows.length > 0)
				{
					//_data.selectsNum 欲取得筆數
					if(typeof _data.selectsNum == "undefined" || _data.selectsNum == 0)
					{
						var selectData = (_data.pn % result.rows.length);
						_data.supplierInfo = result.rows[selectData];
						_data.pn++;
					}
					else
					{
						_data.supplierInfo = [];
						for(var i=0;i<_data.selectsNum;i++)
						{
							//file upload use
							var selectData = (_data.pn % result.rows.length);
							_data.supplierInfo.push(result.rows[selectData]);
							_data.pn++;
						}

						//smartprovision controller use
						_data._result.message ="get path success";
						_data._result.result = 1;
						_data._result.data = _data.supplierInfo;
					}
				}	
				// console.log(_data.supplierInfo);
				_callBack(false,job);
			});

		}
		catch(e)
		{
			console.log(e);
			_callBack(e);
		}
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}