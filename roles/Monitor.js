var storage,
	commands,
	schedule = require('node-schedule'),
	monitor = require('../modules/monitor.js');

module.exports = {

init: function(_storage, _commands) {
	storage = _storage;
	commands = _commands;

	return this;
},

do: function() {
	var job = setInterval(function() {
    	monitor.listComputerNode(function(_data) {
    		for(var key in _data) {
    			module.exports.getMachineData(_data[key].machine_name, module.exports.writeMachineData);
    		}
    	});
	}, 5000);
},

getMachineList: function() {
	var rsdata = [],
		tmpdata = storage.get("resource");

	if(tmpdata != -1) {
		for(var key in tmpdata) {
			if(key != "timestamp") {
				rsdata.push(key);
			}
		}
	}

	return rsdata;
},

getMachineData: function(_host, _callback) {
	monitor.all(_host, _callback);
},

writeMachineData: function(_data) {
	if(_data.RESULT == 1) {
		var saveJSON = {
			"cpu": {
				"loading": parseFloat(_data["DATA"]["cpu_usage"])
			},
			"ram": {
				"total": parseInt(_data["DATA"]["mem_total"]),
				"free": parseInt(_data["DATA"]["mem_free"]),
				"loading": parseFloat(_data["DATA"]["mem_usage"])
			},
			"disk": {
				"total": parseInt(_data["DATA"]["disk_total"]),
				"free": parseInt(_data["DATA"]["disk_available"]),
				"loading": parseFloat(_data["DATA"]["disk_used_percent"])
			},
			"network": {
				"vm": {
					"rx": parseInt(_data["DATA"]["network_vm_rx"]),
					"tx": parseInt(_data["DATA"]["network_vm_tx"])
				},
				"manage": {
					"rx": parseInt(_data["DATA"]["network_manage_rx"]),
					"tx": parseInt(_data["DATA"]["network_manage_tx"])
				},
				"storage": {
					"rx": parseInt(_data["DATA"]["network_storage_rx"]),
					"tx": parseInt(_data["DATA"]["network_storage_tx"])
				},
				"public": {
					"rx": parseInt(_data["DATA"]["network_public_rx"]),
					"tx": parseInt(_data["DATA"]["network_public_tx"])
				}
			}
		};

		module.exports.write( "resource." + _data.DATA.hostname, saveJSON);
	}
},

write: function(_key, _data) {
	storage.post(_key, _data);
	// console.log(JSON.stringify(storage.get("resource")));
	// console.log(JSON.stringify(this.getMachineList()));
}

};