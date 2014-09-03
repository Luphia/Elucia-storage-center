// 最大 cmdList 數量
var maxListAmount = 5;
// 索引陣列
var cmdList = [];
// 指令池
var cmdPool = {};

module.exports = {

	// 建立新指令至 pool
	post: function(cmd, callBack){	
		//console.log("in function post");
		var value;
		var getData = function(data) {
			// 對應至 post: function，callBack 給前端
			value = data;
			//callBack(data);
		}

		// 取得 key
		this.updateList(cmd, getData);
		cmd.setID(value);
		return value;
	},
	// 更新 List
	updateList: function(cmd, callBack){
		//console.log("in function updateList");
		
		// 在 cmdList 取得空的 key，再指定給 cmd		
		var flag = 0;
		for(var key in cmdList){
			if(typeof(cmdList[key]) == 'undefined' || cmdList[key] == '' || cmdList[key] == null) {
				// 從 cmdList 取得 cmd 對應的 key
				cmdList[key] = cmd;
				// cmdPool 存放 key 與 cmd
				cmdPool[key] = cmd;				
				flag = 1;
				callBack(key);				
			}
		}
		
		// 若 cmdList 沒有空位可取得 key，則 append 新值
		if(flag == 0){
			// 從 cmdList 取得 cmd 對應的 key				
			newKey = cmdList.length;
			cmdList[newKey] = cmd;
			// cmdPool 存放 key 與 cmd			
			cmdPool[newKey] = cmd;	
			//console.log("cmd: " + cmdPool[newKey]);
			if(cmdList.length > maxListAmount){
				maxListAmount = maxListAmount + 1;
			}
			callBack(newKey);
		}
	},
	
	// 取出指令
	get: function(key, callBack){
		// for (property in cmdPool) {
			// console.log("######  cmdPool property = " +property);
		// }			
		if(typeof(cmdList[key]) == 'undefined'){
			return "-1";
		}else{
			return cmdList[key];
		}
	},	
	
	// update 指令至 pool
	put: function(key, updatecmd, callBack){
		if(typeof(cmdPool[key]) == 'undefined'){
			return "-1" ;
		}else{
			cmdPool[key] = updatecmd;
			cmdList[key] = updatecmd;
			return "PutOK";
		}		
	},
		
	// 刪除指令
	delete: function(key, callBack){
		if(typeof(cmdPool[key]) == 'undefined'){
			return "-1";
		}else{
			// undefined key
			delete cmdPool[key];
			cmdList[key] = '';
			console.log("cmdList.length: " + cmdList.length);
			// 若超過 maxListAmount 的值直接刪除
			if(key >= maxListAmount - 1){
				console.log("remove key: " + key);
				cmdList.splice(key,1);					
			}

			return "DeleteOK";
		}			
	},
	
	// 列出所有指令
	list: function(callBack){
		return cmdList;
	}
}