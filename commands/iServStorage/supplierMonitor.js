module.exports = function() {

var job,
	serverIP,
	data,
	oldData,
	config,
	todo = 0,

	/** private function **/
	listSupplierNode = function(callBack) {
		//console.log("####### in function listSupplierNode ######## ");
		var sql_getALL  = "SELECT DISTINCT u.machine_ip, u.id machine_id, i.name machine_name ";
			sql_getALL += "FROM supplier_info i inner join supplier_usage u on i.supplier_id = u.supplier_id ";
			sql_getALL += "WHERE status > -1";

				
		var getAll = function(err,result) {
			if(!err){
				//console.log("getALL");
				//console.log(result.rows);
				callBack(result.rows);					
			}else{
				callBack(err);
			}
	
		};
		
		try {		
			//queryDB(sql_getALL,config,getAll);
			//console.log(config);
			var cDb = require("../../modules/queryDB.js");
			db = new cDb().queryDB(sql_getALL,config,getAll);
		}
		catch(e){
			console.log(e);
			_callback(e);
		}
		
	},
	
	getMachineData = function(rdata, callBack, _callback2) {
		//console.log("####### in function getMachineData ######## ");

		// split ip and port
		var arr = rdata["machine_ip"].split(":");
		var ip = arr[0];
		var portnum = arr[1]; 
		var machine_id = rdata["machine_id"];
		var machine_name = rdata["machine_name"];
		var machine_ip = rdata["machine_ip"];
	
		//console.log("post to ip:port = " + ip + ":" + portnum);
		
		var http = require('http');
		var options = {  
			host: ip,   
			port: portnum,   
			path: "/hwinfo"  
		};   
		var req = http.get(options, function(res) {

			//console.log("Got response: " + res.statusCode);   
			res.on('data', function(chunk) {  
				//console.log("Body: " + chunk);
				data.ARGS = 'all';
				data.API = 'supplierMonitor.js';

				var chunkData = JSON.parse(chunk);
				chunkData.data.ip = machine_ip;
				chunkData.data.name = machine_name;
				chunkData.data.id = machine_id;
				
				// init
				// var now = parseInt(Date.now() / 1000);
				// var saveJSON = {
					// "id": machine_id,
					// "name": machine_name,
					// "ip": machine_ip,
					// "status": 0,
					// "timestamp": now
				// };				
				// data.data[machine_id] = saveJSON;
				
				//data.data.ip.data = JSON.parse(chunk);
				// if(ip == "10.10.20.94"){
					// console.log(chunk);
				// }
				//console.log(chunk);
				//console.log('STATUS: ' + res.statusCode);
				if(res.statusCode == 200){
					callBack(machine_id, chunkData, _callback2);
				}else{
					callBack(false, _callback2);
				}
										
			});
		}).on('error', function(e) {
			console.log("Machine id [ " +  machine_id + " ] connection err: "  + e.message);
			var now = parseInt(Date.now() / 1000);
			var err = "undefined";
			var saveJSON = {
				"id": rdata["machine_id"],
				"name": rdata["machine_name"],
				"ip": rdata["machine_ip"],
				"status": 0,
				"timestamp": now
			};
			data.data[machine_id] = saveJSON;
			//callBack(machine_id, err, _callback2);
			callBack(machine_id, data,_callback2);
			return;			
			//callBack(e);
		});  

	},
	
	writeMachineData = function(machine_id, _data, _callback) {
		// console.log("data: " + _data.result);
		// console.log("data: " + _data.data);
		
		// check is exist oldData
		var now = parseInt(Date.now() / 1000);
		// console.log(data.oldData[machine_id]);
		// console.log(data.oldData[machine_id].timestamp);
		// console.log((data.supplierMonitorPeriod)/1000);
		// console.log("now:" + now);
		// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");		
		if(typeof(data.oldData) != "undefined"){
			if(typeof(data.oldData[machine_id]) != "undefined"){
				console.log("data.oldData[machine_id].timestamp:" + data.oldData[machine_id].timestamp);
				if((data.oldData[machine_id].timestamp + (data.supplierMonitorPeriod)/1000) > now){
					console.log(" =====================> stop update monitor data");
					//console.log(data.oldData['2']);
					data.data[machine_id] = oldData[machine_id];
					_callback(false, job);
					return;
				}
			}
		}		
		
		var saveJSON = {};
		if(_data == false || typeof(_data) == "undefined"){
			//_callback(false, job);
			saveJSON = {
				"status": 0,
				"timestamp": now
			}
		}

		if(_data.result == 1) {
			var network_rx = 0,
				network_tx = 0,
				network_rx_old = 0,
				network_tx_old = 0;	
			if(typeof(data.data[machine_id]) != "undefined"){
				if(typeof(data.data[machine_id].network) != "undefined"){
					if(typeof(data.data[machine_id].network.rx_accumulate) != "undefined" ){
						network_rx = parseInt(_data["data"]["rx_bytes"]) - data.data[machine_id].network.rx_accumulate;
						network_rx_old = parseInt(_data["data"]["rx_bytes"]);
					}else{
						network_rx = 0;
						network_rx_old = parseInt(_data["data"]["rx_bytes"]);				
					}
					if(typeof(data.data[machine_id].network.tx_accumulate) != "undefined" ){
						network_tx = parseInt(_data["data"]["tx_bytes"]) - data.data[machine_id].network.tx_accumulate;
						network_tx_old = parseInt(_data["data"]["tx_bytes"]);
					}else{
						network_tx = 0;
						network_tx_old = parseInt(_data["data"]["tx_bytes"]);					
					}
				}else{
					network_rx = 0;
					network_tx = 0;
					network_rx_old = parseInt(_data["data"]["rx_bytes"]);
					network_tx_old = parseInt(_data["data"]["tx_bytes"]);				
				}			
			}else{
				network_rx = 0;
				network_tx = 0;
				network_rx_old = parseInt(_data["data"]["rx_bytes"]);
				network_tx_old = parseInt(_data["data"]["tx_bytes"]);
			}

			saveJSON = {
				"id": _data["data"]["id"],
				"name": _data["data"]["name"],
				"ip": _data["data"]["ip"],
				"cpu": {
					"loading": parseFloat(_data["data"]["cpu"])
				},
				"ram": {
					"total": parseInt(_data["data"]["totalmem"]),
					"free": parseInt(_data["data"]["freemem"]),
					"loading": parseInt(_data["data"]["usagemem"])
				},
				"disk": {
					"total": parseInt(_data["data"]["total_disk"]),
					"free": parseInt(_data["data"]["total_disk"]) - parseInt(_data["data"]["used_space"]),
					"loading": parseInt(_data["data"]["used_space"])
				},	
				"network": {
					"rx": network_rx,
					"tx": network_tx,
					"rx_accumulate": network_rx_old,
					"tx_accumulate": network_tx_old 
				},
				"sessions": {
					"amount": _data["data"]["sessions"]
				},
				"timestamp": now,
				"status" : 1
			};
		}

		data.data[machine_id] = saveJSON;

		//console.log(data.data[machine_id]);
		if(finish()) {
			//console.log(data.data);
			_callback(false, job);
		}
	},
	
	finish = function() {
		todo -= 1;
		if(todo == 0 || todo < 0) {
			return true;
		}
		else {
			return false;
		}
	},

	/** public function **/
	init = function(_job) {
		job = _job;
		return this;
	},

	execute = function(_data, _callback) {
		// console.log("####### in function supplierMonitor ######## ");
		
		if(typeof(_data.oldData) != "undefined"){
			oldData = _data.oldData;
		}
		
		if(_data) data = _data;
		serverIP = data._config.serverIP;
		config = data._config;
		//console.log(serverIP);
		//console.log(config);
		data.storeKey = "supplierMonitorData";
		data.storeValue = "data";

    	listSupplierNode(function(_rtdata) {
    		for(var key in _rtdata) {
				getMachineData(_rtdata[key], writeMachineData, _callback);
    			//getMachineData("10.10.20.95:3000", writeMachineData, _callback);
    		}
    	});
	},
	
	that = {
		init: init,
		execute: execute
	};
	return that;

};