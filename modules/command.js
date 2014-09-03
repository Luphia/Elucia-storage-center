/*
result:
0 = failed 
1 = succeed
101 = doing
102 = paused
103 = stopped
104 = losed

data._result = {
	result: 1,
	message: "",
	data: {}
}
*/
module.exports = function() {
	var ID,
		message,
		remote = {
			address: null,
			session: null
		},
		api,
		worker,
		result,
		jobResult = new require("./jobResult")(),
		progress = 0,
		step = 0,
		todoList = [],
		doingList = [],
		jobQueue = [],
		data,
		log = [],
		error = [],
		response,
		create,

	/** private function **/
	reload = function() {
		jobQueue = doingList;
		tmpLog = "recovery";
		pushLog(tmpLog);
	},
	nextStep = function() {
		if(result == 103) {
			tmpLog = "command stop";
			pushLog(tmpLog);
			return false;
		}
		else if(step < todoList.length && doingList.length == 0) {
			result = 101;

			if(step > 0) {
				var tmpLog = "step" + step + " - done";
				pushLog(tmpLog);
			}
		
			doingList = todoList[step].slice(0);
			jobQueue = todoList[step].slice(0);

			step += 1;
			tmpLog = "step" + step + " - start";
			pushLog(tmpLog);
			
			return result;
		}
		else if(doingList.length == 0 && result != 1) {
			var tmpLog = "step" + step + " - done";
			pushLog(tmpLog);
			
			finish();
			return result;
		} else {
			return false;
		}
	},
	finish = function() {
		result = 1;
		progress = 100;

		var tmpLog = "Finish job";
		pushLog(tmpLog);
	},
	setProgress = function(_progress) {
		var tmpProgress = progress;

		if(_progress.toString().substr(0,1) == "+") {
			tmpProgress += parseInt(_progress);
		}
		else {
			tmpProgress = parseInt(_progress);
		}

		if(tmpProgress > 100) {
			tmpProgress = 100;
		}

		progress = tmpProgress;
		
		return this;
	},
	pushLog = function(_log) {
		var tmpLog = {};

		if(typeof(_log) == "object") {
			tmpLog = _log;
		} else {
			tmpLog.message = _log;
		}
		
		tmpLog.timestamp = new Date().getTime();
		log.push(tmpLog);
	},

/** public function **/
	init = function(_data, _config) {
		if(typeof(_data) == "undefined") { _data = {}; }
		if(typeof(_config) == "undefined") { _config = {}; }
	
		if(_data.ID) { ID = _data.ID; }
		if(_data.message) { message = _data.message; }
		if(_data.remote) { remote = _data.remote; }
		if(_data.api) { api = _data.api; }
		if(_data.worker) { worker = _data.worker; }
		if(_data.result) { result = _data.result; }
		if(_data.progress) { progress = _data.progress; }
		if(_data.step) { step = _data.step; }
		if(_data.todoList) { todoList = _data.todoList; }
		if(_data.doingList) { doingList = _data.doingList; }
		if(_data.jobQueue) { jobQueue = _data.jobQueue; }
		if(_data.data) { _data.data["_config"] = _config; data = _data.data; }
		else { data = {"_config": _config}; }
		if(_data.log) { log = _data.log; }
		if(_data.error) { error = _data.error; }
		if(_data.response) { response = _data.response; }
		if(_data.create) { create = _data.create; reload(); }
		else { create = new Date().getTime(); }
		data._result = {
			"result": 0,
			"message": "",
			"data": {}
		};

		nextStep();
		return this;
	},
	
	setID = function(_ID) {
		ID = _ID;
	},

	assign = function(_worker) {
		worker = _worker;
	},
	
	getProgress = function() {
		return progress;
	},

	getJob = function() {
		var tmpJOB = jobQueue.pop(),
			tmpLog;

		if(tmpJOB) {
			tmpLog = "step" + step + "." + tmpJOB.command + " - start";
		}
		else {
			tmpLog = "step" + step + " all doing ";
			tmpJOB = false;
		}

		pushLog(tmpLog);
		return tmpJOB;
	},

	hasJob = function() {
		return (jobQueue.length > 0);
	},

	done = function(_doing) {
		var tmpI = doingList.indexOf(_doing);
		if(tmpI > -1) {
			doingList.splice(tmpI, 1);
			
			var tmpLog = "step" + step + "." + _doing.command + " - done";
			pushLog(tmpLog);
			
			setProgress(_doing.progress);
		}

		return nextStep();
	},

	toStep = function(_step) {
		if(doingList.length == 0) {
			step = _step;
			var tmpLog = "Go to step " + _step;
			pushLog(tmpLog);
			nextStep();
			return true;
		}
		else {
			return false;
		}
	},

	pause = function() {
		result = 102;
	},

	stop = function() {
		result = 103;
	},
	
	lose = function() {
		result = 104;
	},

	pushError = function(_err) {
		var tmpErr = {
			"error": _err,
			"timestamp": new Date().getTime()
		},
		tmpLog = "error[" + (error.length) + "] happend";
		
		error.push(tmpErr);
		pushLog(tmpLog);
	},

	getDoing = function() {
		return doingList;
	},
	
	getTodo = function() {
		return todoList;
	},

	getStep = function() {
		return step;
	},
	
	getResult = function() {
		return result;
	},

	getJobResult = function() {
		if(data._result) {
			jobResult.setCommand("/command/" + ID);
			data._result.result && jobResult.setResult(data._result.result);
			data._result.message && jobResult.setMessage(data._result.message);
			data._result.data && jobResult.setData(data._result.data);
		}

		return jobResult.toJSON();
	},
	
	getData = function() {
		return data;
	},
	
	getLog = function() {
		return log;
	},
	
	getError = function() {
		return error;
	},
	
	getOutput = function() {
		var rt = {
			"ID": ID,
			"path": "/command/" + ID,
			"message": message,
			"remote": remote,
			"api": api,
			"result": result,
			"progress": progress,
			"step": step,
			"data": data,
			"create": create

			,
			"todoList": todoList,
			"log": log,
			"error": error
		};

		return rt;
	},

	cleanLog = function() {
		log = [];
	},

	toJSON = function() {
		var rt = {
			"ID": ID,
			"message": message,
			"remote": remote,
			"api": api,
			"worker": worker,
			"result": result,
			"progress": progress,
			"step": step,
			"todoList": todoList,
			"doingList": doingList,
			"jobQueue": jobQueue,
			"data": data,
			"log": log,
			"error": error,
			"response": response,
			"create": create
		};

		return rt;
	},

	that = {
		init: init,
		setID: setID,
		assign: assign,
		getProgress: getProgress,
		getJob: getJob,
		hasJob: hasJob,
		done: done,
		toStep: toStep,
		pause: pause,
		stop: stop,
		lose: lose,
		pushError: pushError,
		getDoing: getDoing,
		getTodo: getTodo,
		getStep: getStep,
		getResult: getResult,
		getJobResult: getJobResult,
		getData: getData,
		getLog: getLog,
		getError: getError,
		getOutput: getOutput,
		cleanLog: cleanLog,
		toJSON: toJSON
	};

	return that;

};