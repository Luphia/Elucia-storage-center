/* 測試
command = {
"commandID": "xxx",
"progress": 0,
"todoList": [
  [{"command": "getImageInfo", "progress": 50,"imageid":111}],
  [{"command": "downloadImage", "progress": 10,"imageid":111}],
  [{"command": "buildResource", "progress": 10,"imageid":111}],
  [{"command": "buildImageStore", "progress": 10,"imageid":111}],
  [{"command": "buildVM", "progress": 20,"imageid":111}]

],
"rabbitMQ": ""
}

var getData = function(data) {
	console.log(JSON.stringify(data));	
}
var worker = require( './modules/worker.js' );
worker.init(command,getData);
worker.do(getData);
*/

var tableImageStore = {};
var tableImageStore_screenshot_path = {};
var tableImageStore_tag = {};
var srcIP = "192.169.102.40";
//var dstIP = "192.169.102.8";
var dstIP = "10.10.21.18";
var todoList = [];
var doingList = [];
var step = 0;
var current_progress = 0;
var curr_cmd;
var vm_apply_id;

module.exports = {

	init: function(cmds, callBack) {
		console.log("####### in function init ######## ");
		curr_cmd = cmds; 
		todoList = cmds.todoList;
		callBack && callBack(todoList);

		return this;
	},
	
	do: function(callBack) {
		console.log("####### in function do ######## ");
		step = 0;
//
		for (var cmd in todoList) {
			// 新增至 doingList
			doingList.push(todoList[cmd]);									
		}
		console.log(doingList);
//
		// run
//		if(!typeof(doingList) == "undefined"){
			module.exports.next();
//		}
		
		
		callBack;
	},

	next: function() {
		console.log("####### in function next ######## ");
		console.log(doingList);
		console.log(step);
		if(step >= doingList.length){
			console.log(" ALL Done");
			return;
		}
		var raw = doingList[step];
		var raw_json = JSON.stringify(raw[0]);
		var raw_parse = JSON.parse(raw_json);
		var cmd = raw_parse['command'];
		var imageid = raw_parse['imageid'];
		var progress = raw_parse['progress'];
		//cmds = JSON.parse(raw[0]);
		//cmd = cmds.command;
		
		switch(cmd){
			case "getImageInfo":						
				this.getImageInfo(imageid, progress, this.done);
				break;	

			case "downloadImage":
				this.downloadImage(imageid, progress, this.done);
				break;	

			case "buildResource":
				this.buildResource(imageid, progress, this.done);
				break;

			case "buildImageStore":
				this.buildImageStore(imageid, progress, this.done);
				break;				
				
			case "buildVM":
				this.buildVM(imageid, progress, this.done);
				break;		
				
			case "checkVM":
				this.checkVM(imageid, progress, this.done);
				break;	
				
			default:
				//callBack("Command not found:" + cmd);
		}			
		//callBack;
		
	},	
		
	done: function(progress) {
		console.log("####### in function done ######## ");
		//var deletedoing = doingList.splice(0,1);
		if(!typeof(doingList) == "undefined" || !doingList.length == 0){
			console.log("gogo next");
			step+=1;
			//current_progress += progress;
			curr_cmd.progress = current_progress; 
			console.log(current_progress);
			module.exports.next();
		}else{
			//step = 0;
		}
	},
	
	stop: function(callBack) {
		callBack;
	
	},	
	getProgress: function(callBack) {
		return current_progress;
	},
	
	getDoing: function(callBack) {
		return doingList;
	},

	getStep: function(callBack) {
		return step;
	},
	
	listcmd: function() {
		var cmds = ["getImageInfo","downloadImage","buildResource","buildImageStore","buildVM"];
		return cmds;		
	},

	
	// 取得 image info
	getImageInfo: function(imageId, progress, callBack){
		var todo = 3;
		console.log("####### in function getImageInfo ######## ");		
		var ImageStore_SQL = "SELECT * FROM ImageStore WHERE OID = " + imageId;
		var ImageStore_screenshot_path_SQL = "SELECT * FROM ImageStore INNER JOIN ImageStore_screenshot_path ON ImageStore.id = ImageStore_screenshot_path.IID WHERE ImageStore.OID = " + imageId ;
		var ImageStore_ImageStore_tag_SQL = "SELECT * FROM ImageStore INNER JOIN ImageStore_tag ON ImageStore.id = ImageStore_tag.IID WHERE ImageStore.OID = " + imageId;
		
		var getImageStore = function(data) {
			tableImageStore = data;
			//console.log(tableImageStore);
			//callBack(tableImageStore);
			todo --;
			doCallBack();
		}
		var getImageStore_screenshot_path = function(data) {
			tableImageStore_screenshot_path = data;
			//console.log(tableImageStore_screenshot_path);
			todo --;
			doCallBack();
		}
		var getImageStore_tag = function(data) {
			tableImageStore_tag = data;
			//console.log(tableImageStore_tag);
			todo --;
			doCallBack();
		}
		
		var doCallBack = function(){
			if(todo == 0) {
				current_progress += progress;
				callBack();
			}
		}
		
		var go_1 = this.queryDB(ImageStore_SQL, srcIP,getImageStore);
		var go_2 = this.queryDB(ImageStore_screenshot_path_SQL, srcIP,getImageStore_screenshot_path);
		var go_3 = this.queryDB(ImageStore_ImageStore_tag_SQL, srcIP,getImageStore_tag);
		
		//callBack(tableImageStore);
		//console.log(tableImageStore);
	},
	
	// scp 檔案至 imagestore 機器
	downloadImage: function(imageid, progress, callBack){
		console.log("####### in function downloadImage ######## ");	
		// 呼叫 imagestore_buildimage.pl
		var postData = function(data) {
			console.log("get: " + JSON.stringify(data));
			current_progress += progress;
			callBack();
		}
		
		var image_name_convert = tableImageStore[0].image_name;
		var params = {"params_action":"buildImage","params_imageid":imageid,"params_imagename":image_name_convert,"params_dstip":dstIP,"params_image_src_path":"/var/lib/glance/images"};
		this.posturl("downloadImage", "", srcIP, params, postData);
		
	},

	// 每 30 秒檢驗 .result 檔案
	buildResource: function(imageid, progress, callBack){
		console.log("####### in function buildResource ######## ");	

		var query_interval = 5000;
		var params = {"params_action":"getExecResult","params_dstip":dstIP,"params_image_check_filename":tableImageStore[0].image_name};

		var getData = function(data) {
			var result = JSON.parse(data);
			if(result.result == "1"){
				clearInterval(wait);
				current_progress += progress;
				console.log("==============ok===============");
				callBack();
			}
		}
		
		var new_posturl = this.posturl;
		var wait = setInterval( function() {new_posturl("buildResource", "", srcIP, params, getData);},query_interval);
	},	
	
	// 資料寫回 imagestore table
	buildImageStore: function(imageid, progress, callBack){
		console.log("####### in function buildImageStore ######## ");
		var todo = 3;		
		// console.log(tableImageStore);
		// console.log(tableImageStore_screenshot_path);	
		// console.log(tableImageStore_tag);
		var getImageStore = function(data) {
			todo --;
			doCallBack();
		}
		var getImageStore_screenshot_path = function(data) {
			todo --;
			doCallBack();
		}
		var getImageStore_tag = function(data) {
			todo --;
			doCallBack();
		}
		var doCallBack = function(){
			if(todo == 0) {
				current_progress += progress;
				callBack();
			}
		}
		
		for (var i in tableImageStore) {
			var ImageStore_SQL = "INSERT INTO ImageStore (id,OID,RID,icon_path,display_name,image_name,complexity,description,flavor,status) ";
			ImageStore_SQL    += "VALUES (NULL,'" + tableImageStore[i].OID + "','" + tableImageStore[i].RID + "','" + tableImageStore[i].icon_path + "','";
			ImageStore_SQL    += tableImageStore[i].display_name + "','" + tableImageStore[i].image_name + "','" + tableImageStore[i].complexity + "','";
			ImageStore_SQL    += tableImageStore[i].description + "','" + tableImageStore[i].flavor + "','" + tableImageStore[i].status + "')";
			console.log(ImageStore_SQL);
			this.queryDB(ImageStore_SQL, dstIP,getImageStore);
		}

		for (var i in tableImageStore_screenshot_path) {
			var ImageStore_screenshot_path_SQL = "INSERT INTO ImageStore_screenshot_path (id,IID,screenshot_path) ";
			ImageStore_screenshot_path_SQL    += "VALUES (NULL,'";;
			ImageStore_screenshot_path_SQL    += tableImageStore_screenshot_path[i].IID  + "','";
			ImageStore_screenshot_path_SQL    += tableImageStore_screenshot_path[i].screenshot_path + "')";
			console.log(ImageStore_screenshot_path_SQL);
			this.queryDB(ImageStore_screenshot_path_SQL, dstIP,getImageStore_screenshot_path);
		}

		for (var i in tableImageStore_tag) {
			var ImageStore_ImageStore_tag_SQL = "INSERT INTO ImageStore_tag (id,IID,tag) ";
			ImageStore_ImageStore_tag_SQL    += "VALUES (NULL,'";
			ImageStore_ImageStore_tag_SQL    += tableImageStore_tag[i].IID  + "','";
			ImageStore_ImageStore_tag_SQL    += tableImageStore_tag[i].tag + "')";
			console.log(ImageStore_ImageStore_tag_SQL);
			this.queryDB(ImageStore_ImageStore_tag_SQL, dstIP,getImageStore_tag);
		}			
	},
		
	// 建立 VM
	buildVM: function(imageid, progress, callBack){
		console.log("####### in function buildVM ######## ");
		var postData = function(data) {
			//console.log("get: " + JSON.stringify(data));
			var final_xml;
			if(typeof(data) != "undefined"){
				//console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
				var parseString = require('xml2js').parseString;
				
				parseString(data, function (err, result) {
					//console.dir(result);
					final_xml = result;
					var final_json = JSON.parse(final_xml.result.return_msg[0]);
					vm_apply_id = final_json.DATA.ApplyID;
					//console.log("###########################################");
					//console.log(vm_apply_id);
					current_progress += progress;						
					callBack();					
				});			
			}			

		}	
	
		var params = {"params_imageid":imageid};
		var return_string = this.posturl("buildVM", "", dstIP, params, postData);
		
		// var result_;
		// if(typeof(return_string) != "undefined"){
			// var parseString = require('xml2js').parseString;
			
			// parseString(return_string, function (err, result) {
				// //console.dir(result);
				// result_ = result;
			// });			
		// }
		
		
		// console.log(result_.result.return_msg[0]);
	},
	
	// 檢查 VM
	checkVM: function(imageid, progress, callBack){
		console.log("####### in function checkVM ######## ");
		
		var query_interval = 5000;
		var postData = function(data) {
			//console.log(data[0]);
			//console.log(data[0].excuteTime);
			console.log(vm_apply_id);
			if(data[0].excuteTime === null){
				//console.log("============== checkVM Not OK !! ===============");
			}else{
				clearInterval(wait);
				current_progress += progress;
				console.log("============== checkVM OK !! ===============");
				callBack();							
			}
		}	
		
		var sql = "SELECT excuteTime FROM Apply WHERE id = " + vm_apply_id;
		//var sql = "SELECT excuteTime FROM Apply WHERE id = 1992";
		
		var new_queryDB = this.queryDB;		
		var wait = setInterval( function() {new_queryDB(sql,dstIP,postData);},query_interval);
	},
	
	// 執行 DB query
	queryDB: function(sql,ip,callBack){
		console.log("####### in function queryDB ######## ");
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			host     : ip,
			user     : 'root',
			password : 'openstack',
			port: '3306',      // 使用sock連線
			database: 'iSoftCloudFrontEndDB'
		});
		connection.connect();	  

		var queryString = sql;
		//var return_rows;
		

		connection.query(queryString, function(err, rows, fields) {
			if (err) throw err;
			// console.log(rows);
			// console.log(rows[0]["excuteTime"]);
			// var tmp = {};
			// tmp = rows[0];
			// console.log(tmp);
			// console.log(tmp[0]);
			// var tmprows = JSON.parse()

			//console.log(tmprow.executeTime);
			//console.log(fields);
			callBack (rows);
			// for (var i in rows) {
				// console.log('Post Titles: ', rows[i].post_title);
			// }
		});	
		
		connection.end();
	},	


	posturl: function(action, postFunc, ip, params, callBack) {
		//return;
		var postParams;
		var postFile;
		console.log( "### in posturl" );
		switch(action){
			case "getImageInfo":						

				break;	

			case "downloadImage":
				console.log( "in case downloadImage" );
				postParams = JSON.stringify({
					image_action: params["params_action"],
					image_id: params["params_imageid"] ,
					//image_id: 66,
					image_name: params["params_imagename"],
					image_dst_ip: params["params_dstip"],
					image_src_path: params["params_image_src_path"]
				});
				postFile = "/cgi-bin/imagestore_buildimage.pl";
				break;	
//var params = {"params_action":"getExecResult","params_image_check_filename":"7777.img.result"};
			case "buildResource":
				console.log( "in case buildResource" );
				postParams = JSON.stringify({
					image_action: params["params_action"],
					image_dst_ip: params["params_dstip"],
					image_check_filename: params["params_image_check_filename"]
				});
				postFile = "/cgi-bin/imagestore_buildimage.pl";
				break;	
	
			case "buildVM":
				console.log( "in case buildVM" );
// applyService::appliance::06d60d1ec43252e30164dd20eb90dc4::vm_package::{"vm_name":"TestVM","packageid":"1","rent_start":"2012-09-12","rent_end":"2013-09-12","public_ip":"false","contact_name":"Josh","contact_mail":"josh@iii.org.tw","contact_phone":"12345678"}::2012-09-12%2010:19:00				


				var now = this.getLocalDate();
				postParams  = "applyService::";
				postParams += "appliance::";
				postParams += "06d60d1ec43252e30164dd20eb90dc4::";
				postParams += "vm_package::";
				postParams += '{"vm_name":"' + params["params_imageid"] + '","packageid":"12235","rent_start":"2013-04-03","rent_end":"2014-04-03","public_ip":"true","contact_name":"appliance","contact_mail":"appliance@iii.org.tw","contact_phone":"12345678"}::';
				postParams += now;
				
				postFile = "/api/";
				break;	
			
			default:
				break;
		}		
	
		var http = require('http');		
		//var postString = JSON.stringify(postParams);
		var postString = postParams;
		console.log(postString);
		console.log(ip);
		console.log(postFile);
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': postString.length
		};
		var options = {
			host: ip,
			port: 8088,
			path: postFile,
			method: 'POST',
			headers: headers
		};
		// var options = {
			// host: "192.169.102.40",
			// port: 8088,
			// path: "/cgi-bin/imagestore_buildimage.pl",
			// method: 'POST',
			// headers: headers
		// };		

		var req = http.request(options, function(res) {		
			res.setEncoding('utf-8');
			console.log( "### in http.request" );
			var responseString = '';

			res.on('data', function(data) {
				console.log( "### in res" );
				responseString += data;
				//jsonstr = JSON.parse(responseString);
				console.log( responseString );
				//console.log( jsonstr.Version );
				//console.log( jsonstr.TimeStamp );			
				callBack(responseString);				
			});

			res.on('end', function() {				
			});
		});

		req.on('error', function(e) {
			// TODO: handle error.
		});

		req.write(postString);
		req.end();		
	},
	
	getLocalDate: function() {
		var now = new Date();
		console.log(now);
		var month = now.getMonth()+1;
		if(month < 10) month = "0" + month;
		var date = now.getDate();
		console.log(date);
		if(date < 10) date = "0" + date;
		var hour = now.getHours();
		if(hour < 10) hour = "0" + hour;
		var minute = now.getMinutes();
		if(minute < 10) minute = "0" + minute;				
		var second = now.getSeconds();
		if(second < 10) second = "0" + second;			

		var then = now.getFullYear()+'-'+ month +'-'+ date;
		then += ' '+ hour +':'+ minute +':'+ second;
		return then;
	},
}