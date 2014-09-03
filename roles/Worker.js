module.exports = function() {

var storage,
	command,
	keepgo = true,
	waiting = false,
	period = 30000,
	redo = false,
	rollback = false,
	callback,

	/** private function **/
	privateFunc = function(_job) {
		tmpCMD = _job.command.split(":");
		tmpFunc = tmpCMD[1];
		tmpData = tmpCMD.slice(2);

		try {
			skills[tmpFunc](tmpData);
			done(false, _job);
		} catch(err) {
			if(err.name.indexOf("[Elucia]") == -1) {
				console.log(err);
				command.pushError(err);
				stop();
			}
		}
	},

	again = function(_data) {
		if(_data[0] > 0) {
			period = _data[0];
		}
		redo = true;
	},

	read = function(_data) {
		var cmdData = command.getData(),
			storageKey = _data[0],
			key = _data[1];

		/*
		console.log(key);
		console.log(storageKey);
		*/
		// console.log("command." + cmdData[key] + ": " + cmdData[cmdData[key]]);
		cmdData[cmdData[key]] = storage.get(cmdData[storageKey]);
		// console.log("command." + cmdData[key] + ": " + cmdData[cmdData[key]]);
	},

	write = function(_data) {
		var cmdData = command.getData();
			key = _data[0],
			value = _data[1];

		/*
		console.log(value);
		console.log(key);
		*/
		// console.log("storage." + cmdData[key] + ": " + storage.get(cmdData[key]));
		// console.log(cmdData[value] + ": " + cmdData[cmdData[value]]);
		// console.log(cmdData[cmdData[value]]);
		storage.post(cmdData[key], cmdData[cmdData[value]]);
		// console.log(storage.get(cmdData[key]));
	},
	checkContinue = function(_data) {
		var cmdData = command.getData(),
			key = _data[0];

		if(!cmdData[key]) {
			uncomplete();
		}
	},

	uncomplete = function() {
		stop();
		callback && callback();
		throw { 
			name: "[Elucia] Job Interrupt",
			level: "Show Stopper", 
			message: "The Job is Stop."
		};
	},

	complete = function() {
		stop();
		callback && callback();
	},

	skills = {
		"continue": checkContinue,
		"again": again,
		"read": read,
		"write": write,
	},

	/** private skill **/
	writeStorage = function(_key, _value) {
		storage.post(_key, _value);
	},

	wait = function(_time, _callback) {
		
		if(waiting) { return false; }
		waiting = true;

		if(!(_time >= 0)) {
			_time = period;
		}

		stop();
		if(_callback) {
			setTimeout(_callback, _time);
		} else {
			setTimeout(execute, _time);
		}
	},

	setRedo = function(_bool) {
		redo = _bool;
	},

	repeat = function(_time) {
		setRedo(false);
		wait(_time, function() {
			command.cleanLog();
			command.toStep(0);
			execute();
		});
	},

	/** public function **/
	init = function(_storage) {
		storage = _storage;

		return this;
	},

	assign = function(_command) {
		command = _command;

		return this;
	},

	execute = function(_callback) {
		_callback && (callback = _callback);
		keepgo = true;
		waiting = false;
		var job = false;

		if(!keepgo) { return keepgo; }

		while(command.hasJob()) {
			job = command.getJob();
			try {
				if(job.command.slice(0, 1) == ":") {
					privateFunc(job);
				}
				else if(job  && typeof(job.command) == "string") {
					var cmdData = command.getData(),
						cJob = require(cmdData._config.commandPath + job.command)
						currJob = new cJob().init(job);
						
					currJob.logger = console.logger;
					currJob.execute(cmdData, done);
				}
			}
			catch(err) {
				console.log(err);
				command.pushError(err);
				stop();
			}
		}
	},

	done = function(_err, _job) {
		var rs;
		if(_err) {
			console.log(_err);
			command.pushError(_err);
			stop();
		}
		if(_job) {
			rs = command.done(_job);

			if(rs == 101) {
				execute();
			}
			else if(rs == 1) {
				if(redo) {
					complete();
					repeat();
				}
				else {
					complete();
				}
			}
			else {
				return false;
			}
		}
	},

	stop = function() {
		keepgo = false;
	},

	that = {
		init: init,
		assign: assign,
		execute: execute,
		done: done,
		stop: stop
	};

	return that;
};