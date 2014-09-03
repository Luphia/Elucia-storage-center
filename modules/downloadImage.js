/* 測試
############## getImageInfo() ############## 
[ input ]	
	_data = {
	"todo": [
	  [{"command": "getImageInfo","imageid":111}]
	],
	}
[ output(callback) ]
	_callback(false,job)
		
*/	


var srcIP = "192.169.102.40";
var dstIP = "192.169.102.8";
//var dstIP = "10.10.21.18";


module.exports = function() {
	/** public function **/
	init = function(_job) {
		job = _job;
		return this;
	},

	// scp 檔案至 imagestore 機器
	execute = function(_data, callBack){
		// parse _data
		console.log(JSON.stringify(_data));
		
		var raw = _data.todo[0];		
		var raw_json = JSON.stringify(raw[0]);
		var raw_parse = JSON.parse(raw_json);
		var cmd = raw_parse['command'];
		var imageid = raw_parse['imageid'];	
		
		// 呼叫 imagestore_buildimage.pl
		var postData = function(data) {
			//console.log("get: " + JSON.stringify(data));
			callBack(false,job);
		}
		console.log("=======================");
		var gettableImageStore = _data.tableImageStore;
		var image_name_convert = gettableImageStore[0].image_name;		
		console.log(image_name_convert);
		
		var params = {"params_action":"buildImage","params_imageid":imageid,"params_imagename":image_name_convert,"params_dstip":dstIP,"params_image_src_path":"/var/lib/glance/images"};
		
		var post = require( './posturl.js' );
		
		try {
			post.posturl("downloadImage", "", srcIP, params, postData);
		}
		catch(e){
			callBack(e);
		}
		
	},
	
	that = {
		init: init,
		execute: execute
	};
	return that;		
}	
	