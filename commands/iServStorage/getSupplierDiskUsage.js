
module.exports = function() {
	var job,
	/** public function **/
	init = function(_job) {
		job = _job;
		return this;
	},


	execute = function(_data, _callBack){
		console.log("####### in function getSupplierDiskUsage ######## ");
		 
		// fake data
		// _data.period_start = 1382918400;
		// _data.period_end = 1382936400;
				
		var period_start = _data.period_start;
		var period_end = _data.period_end;
		
		// get download & upload usage
		var	sql  = "SELECT supplier_info.name AS name, SUM(client_usage_raw.usage) AS disk ";
		sql     += "FROM client_usage_raw,supplier_info ";
		sql     += "WHERE supplier_info.supplier_id = client_usage_raw.supplier_id AND ";
		sql     += "usage_type = 2  AND ";
		sql     += "timestamp >= " + period_start + " AND ";
		sql     += "timestamp <= " + period_end + " ";
		sql     += "GROUP BY name";
		
		//console.log(sql);
		
		try {
			var cDb = require("../../modules/queryDB.js");
			db = new cDb().queryDB(sql,_data._config,function(err,result){
				if(!err){	

					for(var key in result.rows) {
						for(var oldKey in _data._result.data.supplier){
							if(_data._result.data.supplier[oldKey].name == result.rows[key].name){								
								_data._result.data.supplier[oldKey].disk = result.rows[key].disk;
							}
						}
						
					}

					_data._result.message = "";
					_data._result.result = 1;
					console.log(_data._result.data);
					_callBack(false, job);				
				}	
				else{
					console.log(err);
					_callBack(false, job);
				}						
			});
		}
		catch(e) {
			_callBack(e);
		}
	
			
	},
	
	
	that = {
		init: init,
		execute: execute
	};
	return that;		
}	