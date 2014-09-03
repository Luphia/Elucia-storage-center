
module.exports = function() {
	var job,
	/** public function **/
	init = function(_job) {
		job = _job;
		return this;
	},


	execute = function(_data, _callBack){
		console.log("####### in function getUserUsageDiskHour ######## ");
		 
		// fake data
		// _data.client_id = 1;
		// _data.period_start = 1382918400;
		// _data.period_end = 1382936400;
				
		var period_start = parseInt(_data.period_start);
		var period_end = parseInt(_data.period_end);
		var client_id = _data.client_id;

		// console.log(period_start);
		// console.log(period_end);
		// console.log(client_id);
		
		var hour_arr = [];		
		var hour_arr_counter = 0;		
		var hour_value = [];
		var hour_value_counter = 0;	

		// check if period_start >= period_end
		if(period_start >= period_end){
			_data._result.result = 0;
			_data._result.message = "period_start >= period_end";
			_data._result.data = "";			
			callBack(false,job);
			return;
		}
		
		// get all hour
		while( period_start < period_end ){		
			hour_arr[hour_arr_counter++] = period_start;
			period_start = period_start + 3600;	
		}
		
		for (var key in hour_arr){
			console.log(hour_arr[key]);
			
			var tmp_value = hour_arr[key];
			var tmp_period_start = tmp_value - 3600;
			var tmp_period_end = tmp_value + 3600;
			
			var	sql  = "SELECT usage FROM client_usage_raw ";
			sql     += "WHERE usage_type = 2 AND ";
			sql     += "client_id = " + client_id + " AND ";
			sql     += "timestamp >= " + tmp_period_start + " AND ";
			sql     += "timestamp <= " + tmp_period_end + " ";
			sql     += "ORDER BY timestamp DESC limit 1";			

			//console.log(sql);
			
			try {
				var cDb = require("../../modules/queryDB.js");
				db = new cDb().queryDB(sql,_data._config,function(err,result){
					if(!err){
						if(typeof(result.rows[0]) != "undefined"){
							hour_value[hour_value_counter++] = result.rows[0].usage;
							console.log("hour_value : " + result.rows[0].usage);
						}else{
							hour_value[hour_value_counter++] = 0;
							console.log("hour_value : 0");
						}						
						hour_arr_counter--;	
						
						//console.log("hour_arr_counter : " + hour_arr_counter);						
						doCallBack();			
					}	
					else{
						console.log(err);
						//_callBack(false, job);
					}						
				});
			}
			catch(e) {
				_callBack(e);
			}
			//break;
			
		}
		
		var doCallBack = function(){
			if(hour_arr_counter == 0) {
				var sum_value = 0;
				for(var key in hour_value){
					sum_value += hour_value[key];
				}
				_data._result.result = 1;
				_data._result.message = "";
				_data._result.data = { 
					"disk_hour_sum" : sum_value ,
					"total_hour" : hour_value_counter
				};

				_callBack(false,job);
			}
		}	
		
		
		// var	sql  = "SELECT client_account.account AS account, SUM(client_usage_raw.usage) AS traffic ";
		// sql     += "FROM client_usage_raw,client_account ";
		// sql     += "WHERE client_account.client_id = client_usage_raw.client_id AND ";
		// sql     += "usage_type =2 AND ";
		// sql     += "timestamp >= " + period_start + " AND ";
		// sql     += "timestamp <= " + period_end + " ";
		// sql     += "GROUP BY account";

		
		//console.log(sql);
		
		// try {
			// var cDb = require("../../modules/queryDB.js");
			// db = new cDb().queryDB(sql,_data._config,function(err,result){
				// if(!err){			
					// _data._result.user_diskhour_usage = result.rows[0].disk_usage;
					// console.log(_data._result.user_diskhour_usage);
					// _callBack(false, job);				
				// }	
				// else{
					// console.log(err);
					// _callBack(false, job);
				// }						
			// });
		// }
		// catch(e) {
			// _callBack(e);
		// }
	
			
	},
	
	
	that = {
		init: init,
		execute: execute
	};
	return that;		
}	