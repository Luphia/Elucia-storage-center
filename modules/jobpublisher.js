var config
  , storage
  , commands
  , connection
  , amqp = require('amqp')
  , uuid = require('uuid')
  , rpc;

var JobResponse = function(err, response) {
	if(err) {
		console.error(err);
	}
	else {
		console.log("response", response);
	}
};

module.exports = {
	init: function(_commands, _storage, _config) {
		commands = _commands;
		storage = _storage;
		config = _config;

		connection = amqp.createConnection(_config.rabbitMQ);
		rpc = new (require('./amqprpc'))(connection);

		connection.on("ready", function(){
			/*
			console.log("ready");
			setInterval( function() {
    			module.exports.pushJob({"go": "gogo"});
    		}, 2000);
			*/
		});

		return this;
	},

	pushJob: function(_job) {
		rpc.makeRequest('msg_queue', JSON.stringify(_job), JobResponse);
	}
};