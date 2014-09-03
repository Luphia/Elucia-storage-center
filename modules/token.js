var crypto = require('crypto')
	, secret = "ooxx99224466abab"
	, algorithm = "aes-256-cbc";

module.exports = {
	init: function(_config) {
		_config && _config.crypto && _config.crypto.secret && (secret = _config.crypto.secret);
		_config && _config.crypto && _config.crypto.algorithm && (algorithm = _config.crypto.algorithm);

		return this;
	}
	, check: function(_token) {
		var rs = module.exports.decode(_token);

		return (rs.clientId > -1);
	}
	, encode: function(_username, _uid, _date, _ip) {
		var text = _username + "|" + _uid + "|" + _date + "|" + _ip
			, cipher = crypto.createCipher(algorithm, secret)
			, token = cipher.update(text, 'utf8','hex')
		
		token += cipher.final('hex');

		return token;
	}
	, decode: function(_token) {
		var decipher = crypto.createDecipher(algorithm, secret)
			, tmpArr
			, detail = {
				"username": "",
				"clientId": -1,
				"date": -1,
				"ip": ""
			};

		try {		
			var dec = decipher.update(_token, 'hex','utf8');
			dec += decipher.final('utf8');
			tmpArr = dec.split("|");

			if(tmpArr.length == 4) {
				detail.username = tmpArr[0];
				detail.clientId = tmpArr[1];
				detail.date = tmpArr[2];
				detail.ip = tmpArr[3];
			}
		}
		catch(e) {
			
		}
		
		return detail;
	}

	,authToken : function(_token){


		

	}

}