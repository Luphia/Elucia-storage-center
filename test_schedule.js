var schedule = require('node-schedule');

/* 這是 scheduler 行為 */
var j = schedule.scheduleJob('1 * * * *', function() {
    //console.log('The answer to life, the universe, and everything!');
});


//var play = require('./commands/do.js').do();

// test
//var play = require('./commands/CloudAppliance/monitor.js').do();

// call `read` method from read.js to read `source.txt`

// var play = require( './commands/CloudAppliance/monitor.js' );
// play.do( 'i am josh', function( data ){
  // // change `I am` to `You are`
  // var changed = data.replace( 'i am', 'you are' );
 
  // // print out the data
  // play.print( data );
  // play.print( changed );
// });

// var getData = function(data) {
	// console.log("get: " + JSON.stringify(data));
// }
// var post = require( './commands/CloudAppliance/monitor.js' ).posturl("192.169.102.40", getData);


/*
var getall = require( './commands/CloudAppliance/monitor.js' );
getall.all( '192.169.102.40', function( data ){
  // change `I am` to `You are`
  // var changed = data.replace( 'i am', 'you are' );
 
  // print out the data
  getall.posturl( '192.169.102.40' );
});
*/
// var getall = require( './commands/CloudAppliance/monitor.js' ),
// post = require( './commands/CloudAppliance/monitor.js' );

// getall.all( function(){
  // post.posturl();
// });

/* // ok
var getall = function(data) {
	//console.log("get: " + JSON.stringify(data));
	console.log("getall data: " + JSON.stringify(data));
}

var post = require( './commands/CloudAppliance/monitor.js' ).all('192.169.102.40', getall);
*/

// var newvalue;
// var getall = function(data) {
	// //console.log("get: " + JSON.stringify(data));
	// console.log("get data: " + data);
	// newvalue = data;
// }
// var getvalue = function(data) {
	// //console.log("get: " + JSON.stringify(data));
	// console.log("&&&&&&&&&&&: " + data);
// }
// var getlist = function(data) {
	// //console.log("get: " + JSON.stringify(data));
	// for(var key in data){
		// console.log("[ " + key + " : " + data[key] + "]");
	// }
// }

/*
var key = require( './modules/cmdqueue.js' );

for (i=0; i<100; i++){
	var value = key.post('[' + i + ': ls -al]');
	if(i%2 == 1) key.delete(value);
}
var list = key.list();

for(var kkey in list){
	console.log("[ " + kkey + " : " + list[kkey] + "]");
}
*/


// for (i=0; i<8; i=i+1){
	// //var key = require( './commands/CloudAppliance/cmdqueue.js' ).post(i + ': ls -al', getall);
	// key.post('[' + i + ': ls -al]', getall);

	// //key.get(i, getvalue);
// }

// key.delete(6, getvalue);
// key.get(6, getvalue);
// key.delete(7, getvalue);
// key.get(7, getvalue);

// for (i=0; i<10; i++){
	// //var key = require( './commands/CloudAppliance/cmdqueue.js' ).post(i + ': ls -al', getall);
	// var value = key.post('[' + i + ': date]', getall);
	// console.log("$$$$$$$$$$$$: value"+ value);
	// if(i%2 == 1) key.delete(value, getvalue);
	// //key.get(i, getvalue);
// }




//key.delete(, getvalue);
// key.get(7, getvalue);


// key.put(2,'[sudo date]', getvalue);
// key.delete(3, getvalue);
// key.post("[new cmd1]",getall);
// key.get(3, getvalue);

// key.post("[new cmd2]",getall);
// key.delete(6, getvalue);
// key.post("[new cmd3]",getall);

//key.list(getlist);


// var value = require( './modules/cmdqueue.js' ).get(1, getall);
// var value = require( './modules/cmdqueue.js' ).get(0, getall);
// var value = require( './modules/cmdqueue.js' ).get(5, getall);

/*
var k = require( './modules/cmdqueue.js' );
value = k.post({"command": 0});
console.log(value);
console.log(k.get(value));
value1 = k.post({"command": 1});
console.log(k.get(value1));
k.delete(value);
console.log(k.get(value));
console.log(k.get(value1));
*/

// 測試 command 功能
var com = require( './modules/command.js' ).init(
{
"commandID": "xxx",
"progress": 0,
"todoList": [
  [{"command": "getImageInfo", "progress": "+50","imageid":111}],
  [{"command": "downloadImage", "progress": "+10","imageid":111}],
  [{"command": "buildResource", "progress": "+10","imageid":111}],
  [{"command": "buildImageStore", "progress": "+10","imageid":111}],
  [{"command": "buildVM", "progress": "+20","imageid":111}]

],
"rabbitMQ": ""
}
);

var myjob = [];

function getJOB() {
	var thisJob
	thisJob = com.getJob();
	
	if(thisJob) {
		myjob.push(thisJob);
		console.log("get JOB!");
		console.log(myjob);
	}
}

function finishJOB() {
	var tmpJ;

	if(tmpJ = myjob.pop()) {
		var rs = com.done(tmpJ);
		if(rs == 1) {
			clearInterval(a); clearInterval(b); 
			console.log(com.toJSON());
		}
		console.log(rs);
	}
}

function printLOG() {
	console.log(JSON.stringify(com.getLog()));
	//console.log(JSON.stringify(com.toJSON()));
}

var a = setInterval(getJOB, 3000);
var b = setInterval(finishJOB, 5000);

com.pushError("Error!!");