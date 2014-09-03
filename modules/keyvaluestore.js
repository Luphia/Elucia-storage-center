// 數據倉儲
var store = {};

module.exports = {


	//insertData: function (arr,keys,value,i){
	postData: function (store, keys, value, timestamp){
		tmpkey = keys.split(".");
		if(tmpkey.length > 1) {
			if(typeof(store[tmpkey[0]]) == "undefined") {
				store[tmpkey[0]] = {};
			}
			var newkey = tmpkey.slice(1).join(".");

			this.postData(store[tmpkey[0]], newkey, value,timestamp);
		} else {
			store[tmpkey[0]] = value;
			store["timestamp"] = timestamp;
			//console.log("########");
			//console.log(store["timestamp"]);
		}	
		// if(keys.length == 0) {
			// store = arr;
			// return arr;
		// }
		// if(keys.length == i){
			// //console.log("ok");
			// arr[keys[keys.length-1]] = value;
		// }
		// // 遞迴		
		// var current = {};
		// current[keys[keys.length-1]] = arr;
		// arr = current;
		// keys.pop();		

		// this.insertData(arr,keys,value,i);

	},
	
	getData: function (store, keys, timestamp) {
		tmpkey = keys.split(".");
		if(tmpkey.length > 1) {
			if(typeof(store[tmpkey[0]]) == "undefined") {
			return -1;
		}
		
		var newkey = tmpkey.slice(1).join(".");
		//console.log(tmpkey[0]);
			return this.getData(store[tmpkey[0]], newkey, timestamp);
		} else {
			// 若 timestamp 大於有效期限則不回傳			
			if(timestamp > store["timestamp"]){
				return -1;
			}
			//console.log(tmpkey[0]);
			return store[tmpkey[0]];
		}
	},

	putData: function (store, keys, value, timestamp) {
		tmpkey = keys.split(".");
		if(tmpkey.length > 1) {
			if(typeof(store[tmpkey[0]]) == "undefined") {
			return -1;
		}

		var newkey = tmpkey.slice(1).join(".");
			return this.putData(store[tmpkey[0]], newkey, value, timestamp);
		} else {
			//console.log(value);
			store[tmpkey[0]] = value;
			store["timestamp"] = timestamp;
			
			return store[tmpkey[0]];
		}
	},

	deleteData: function (store, keys) {
		tmpkey = keys.split(".");
		if(tmpkey.length > 1) {
			if(typeof(store[tmpkey[0]]) == "undefined") {
			return -1;
		}

		var newkey = tmpkey.slice(1).join(".");
			return this.deleteData(store[tmpkey[0]], newkey);
		} else {
			delete store["timestamp"];
			delete store[tmpkey[0]];
			return;
		}
	},		
	
	keyvalueStore: function(action,keys,value,timestamp){
		switch(action){
			case "post":						
				this.postData(store,keys,value,timestamp);
				//console.log(JSON.stringify(store));
				break;			

			case "get":			
				return this.getData(store,keys,timestamp);			
				break;
				
			case "put":
				return this.putData(store,keys,value,timestamp);
				break;
				
			case "delete":
				return this.deleteData(store,keys,value);
				break;
				
			case "list":
				break;	
				
			default:
				break;
		}		
	},
	
	// 建立新指令至 pool
	post: function(cmd, value){	
		return this.keyvalueStore("post", cmd, value, Math.round(+new Date()/1000));

	},
	// 取出指令
	get: function(cmd, timestamp){
		if(typeof(timestamp) == "undefined") {
			timestamp = 0;
		}
		return this.keyvalueStore("get", cmd, "", timestamp);
	},	
	// update 指令至 pool
	put: function(cmd, value){
		return this.keyvalueStore("put", cmd, value, Math.round(+new Date()/1000));
	},
		
	// 刪除指令
	delete: function(cmd){
		return this.keyvalueStore("delete", cmd);
	},
	
	// 列出所有指令
	list: function(callBack){
		return store;
	},

	
}