module.exports = function() {
var params,

	/** private function **/
	privateFunction = function() {
		// do something
	},

	/** public function **/
	init = function(_job) {
		job = _job;
		return this;
	},
	execute = function(_data, _callback) {
		try {
			// do something with _data

			_callback(false, job);
		}
		catch(e) {
			_callback(e);
		}
	},

	that = {
		init: init,
		execute: execute
	};
	return that;
};