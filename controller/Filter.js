var commands
	, storage
	, config
	, Token = require("../modules/token")
	, pattern = []
    , nodePattern = []
    , masterPattern = []
	;

module.exports = {
	init: function(_commands, _storage, _config) {
		commands = _commands;
		storage = _storage;
		config = _config;
        pattern = config.filterPath;
        nodePattern = config.nodeFilterPath;
		Token = Token.init(_config);

		return this;
	}

    , nodeEnter: function(_req, _res, _next) {
        var pass = true;

//_req.connection.originalAddress = _req.connection.remoteAddress;
//_req.connection.remoteAddress = _req.headers['public-ip'];
        _req.connection.trustAddress = _req.headers['public-ip'];

        for(var key in nodePattern) {
            if(_req.originalUrl.indexOf(nodePattern[key]) == 0) {
                pass = false;
                break;
            }
        }

        if(pass) {
            _next();
        }
        else if(_req.headers.node) {
            (_req.headers.node.indexOf(":") == -1) && (_req.headers.node = _req.headers.node + ":");

            var tmpNode = _req.headers.node.split(":"),
                node = {
                    "ip": tmpNode[0],
                    "port": tmpNode[1],
                    "url": _req.headers.node
                };

            _req.node = node;

            _next();
        }
        else {
            console.log("[Alert] invalid Node enter !!");
            var currIP = _req.connection.remoteAddress,
                currPort = 3000,
                currURL = currIP + ":" + currPort,
                node = {
                    "ip": currIP,
                    "port": currPort,
                    "url": currURL
                };

            _req.node = node;
            _next();
        }        
    }

	, userEnter: function(_req, _res, _next) {
		if(typeof(_req.session.loginData) == "undefined") {
	    	_req.session.loginData = {
	    		"clientId": -1
	    	};
    	}

    	var token, check = true, expire = false;

    	_req.headers.authorization && ( token = _req.headers.authorization.split("Bearer ")[1]) || (token = "");
    	if(token.length > 5) 
    	{
    		tmpData = Token.decode(token);

            if(tmpData.date + config.expireTime > parseInt(new Date() / 1000)) {

        		_req.session.loginData = 
        		{
    	    		"username": tmpData.username,
    				"clientId": tmpData.clientId,
    				"token": token,
    				"ip": tmpData.ip
    	    	};
            } 
            else {
                expire = true;
            }

	    	// console.log(tmpData);
    	}

    	//check login status
    	for(var key in pattern)
    	{
    		if(_req.originalUrl.indexOf(pattern[key]) == 0 && _req.session.loginData.clientId == -1) 
    		{
    			check = false;
    			break;
    		}
    	}
    	
    	if(!check) 
    	{
    		var rs = new require("../modules/jobResult")();
    		rs.setResult(-1);
    		rs.setMessage("No Promission");
    		_res.send(rs.toJSON());
    	}
        else if(expire) {
            var rs = new require("../modules/jobResult")();
            rs.setResult(-1);
            rs.setMessage("Expired access token");
            _res.send(rs.toJSON());
        }
    	else 
    	{
    		_next();
    	}
	}

	, escapeXss:function(_req, _res, _next)
    {   
        escape = function(_object)
        {
            for(var key in _object)
            {
                if(typeof _object[key] == "object") 
                {
                     escape(_object[key]);
                }
                else if(typeof _object[key] == "string")
                {
                    _object[key] = _object[key].replace(/'/g,"&#39;");
                    _object[key] = _object[key].replace(/"/g,"&quot;");
                    _object[key] = _object[key].replace(/\\/g,"&#165");
                }   
            }       
        }

        escape(_req.body);
        _next();     
	}
}