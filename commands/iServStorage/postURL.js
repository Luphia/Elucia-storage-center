
module.exports = {
	posturl: function(action, postFunc, ip, params, callBack) {
		//return;
		var postParams;
		var postFile;
		var portnum;
		
		console.log( "### in posturl" );
		switch(action){
		
			case "storageInfoSync":
				console.log( "in case storageInfoSync: posturl" );
				postParams = JSON.stringify(params);
				postFile = "/cgi-bin/imagestore_buildimage_http.pl";
				portnum = 80;
				break;
				
			case "checkToken":
				console.log( "in case checkToken: posturl" );
				postParams = JSON.stringify(params);
				postFile = "/check";
				portnum = 3000;
				break;

			case "execConfirm":
				console.log( "in case execConfirm: posturl" );				
				postFile = "/confirm/" + params.path;
				postParams = JSON.stringify(params);
				portnum = 3000;
				break;

			case "supplierMonitor":
				console.log( "in case supplierMonitor: posturl" );				
				// splite ip and port
				var arr = ip.split(":");
				var ip = arr[0];
				var portnum = parseInt(arr[1]); 
							
				postFile = "/hwinfo";
				postParams = JSON.stringify(params);
				break;				
				
			default:
				break;
		}		
	
		var http = require('http');		
		//var postString = JSON.stringify(postParams);
		var postString = postParams;
		console.log(postString);
		console.log(ip);
		console.log(portnum);
		console.log(postFile);
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(postString)
		};
		var options = {
			host: ip,
			port: portnum,
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
								
			});

			res.on('end', function() {
				callBack(responseString);
			});
		});

		req.on('error', function(e) {
			// TODO: handle error.
		});

		req.write(postString);
		req.end();		
	},

	getSuperUserLoginToken: function(ip,callBack){
		//http://10.10.21.22:8080/BusinessSystem/SuperUserLogin?account=admin@iii.org.tw
		var account = 'appliance';
		var postParams = "";
		var postFile = "http://" + ip +"/BusinessSystem/SuperUserLogin?account=" + account;
		console.log("=========================================");
		console.log(postFile);
		var http = require('http');		
		//var postString = JSON.stringify(postParams);
		var postString = postParams;
		console.log(postString);
		console.log(ip);
		console.log(account);
		console.log(postFile);
		var headers = {
			'Content-Type': 'application/json',
			'Content-Length': postString.length
		};
		var options = {
			host: ip,
			port: 8080,
			path: postFile,
			method: 'POST',
			headers: headers
		};	

		var req = http.request(options, function(res) {		
			res.setEncoding('utf-8');
			console.log( "### in http.request" );
			var responseString = '';

			res.on('data', function(data) {
				//console.log( "### in res" );
				responseString += data;
				//jsonstr = JSON.parse(responseString);
				//console.log( responseString );
				//console.log( jsonstr.Version );
				//console.log( jsonstr.TimeStamp );			
							
			});

			res.on('end', function() {
				callBack(responseString);
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