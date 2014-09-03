module.exports = function() {
	var job,

	init = function(_job) {
		job = _job;
		return this;
	},

	execute = function(_data, _callback) {
		var cDb = require("../../modules/queryDB.js");
		db = new cDb();

		var sql = "insert into user_feedback (evaluation, comment, ui_score, ui_comment, operate_score, operate_comment, security_score, security_comment, backup_score, backup_comment, checkbox)"
			+ " values('"+_data.report.eval+"','"+_data.report.comment
			+ "','"+_data.report.ui.score+"','"+_data.report.ui.comment
			+ "','"+_data.report.operate.score+"','"+_data.report.operate.comment
			+ "','"+_data.report.security.score+"','"+_data.report.security.comment
			+ "','"+_data.report.backup.score+"','"+_data.report.backup.comment
			+ "','"+_data.report.checkbox+"');";

		db.queryDB(sql,_data._config,function(err,result) {
			if (err) {
				_data._result.message = "report error";
				_data._result.result = 0;
			} else {
				_data._result.message = "report success";
				_data._result.result = 1;
				_data._result.data = _data.report;
			}
			_callback(false, job);
		});
	},

	that = {
		init: init,
		execute: execute
	};
	return that;
}