module.exports = function() {
	var job,

	init = function(_job) {
		job = _job;
		return this;
	},

	execute = function(_data, _callback) {
		var account = _data.account,
			clientId = _data.clientId,
			queryString = "SELECT * FROM client_account WHERE client_account.account = '" + account + "'";

		try{
			var db = new require("../../modules/queryDB.js")()
			db.queryDB(queryString, _data._config, function(err, result) {
				if (err) {
					console.log(err);
					_data._result.message = "get account error.";
					_data._result.result = 0;
				}
				else {
					_data._result.result = 1;
					if (result.rows.length > 0) {
						_data._result.message = "get same account.";
						_data._result.data = {"account": _data.account};
					}
					else {
						_data._result.message = "no same account.";
					}
				}
				_callback(false, job);
			});	
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
}