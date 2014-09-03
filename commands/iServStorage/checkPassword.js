/*
###             密碼檢查回傳結果           ###
### response.result 為 1 ： 連接資料庫成功 ###
###                    0 ： 連接資料庫失敗 ###
### response.data 有資料 ： 密碼檢查正確   ###
###            undefined ： 密碼檢查錯誤   ###
*/
module.exports = function() {
	var job,

	init = function(_job) {
		job = _job;
		return this;
	},

	execute = function(_data, _callback) {
		var account = _data.account,
			password = _data.password,
			queryString = "SELECT * FROM client_account WHERE client_account.account = '" + account 
				+ "' AND client_account.password = '" + password + "'";

		try{
			var db = new require("../../modules/queryDB.js")()
			db.queryDB(queryString, _data._config, function(err, result) {
				if (err) {
					console.log(err);
					_data._result.message = "connect db error.";
					_data._result.result = 0;
				}
				else {
					_data._result.result = 1;
					if (result.rows.length > 0) {
						_data._result.message = "check password success.";
						_data._result.data = {clientId: result.rows[0].client_id};
					}
					else {
						_data._result.message = "wrong account or password";
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