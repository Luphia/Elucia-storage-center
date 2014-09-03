/*
 * result: 1 成功
 *         0 失敗
 *         -1 無權限
 *         -2 未登入
 */

module.exports = function() {
	this.result = 0;
	this.message = "";
	this.data = {};

	var setResult = function(_result) {
		this.result = _result;
		return true;
	}

	, setMessage = function(_message) {
		this.message = _message;
		return true;
	}

	, setData = function(_data) {
		this.data = _data;
		return true;
	}

	, setCommand = function(_path) {
		this.command = _path;
		return true
	}

	, toJSON = function() {
		return {
			command: this.command,
			result: this.result || 0,
			message: this.message || "",
			data: this.data || {}
		};
	}

	, that = {
		setCommand: setCommand,
		setResult: setResult,
		setMessage: setMessage,
		setData: setData,
		toJSON: toJSON
	};

	return that;
}