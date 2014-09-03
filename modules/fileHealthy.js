/*
config = {
	"fileStrategy": {
		"division": 2,
		"replication": 2
	}
}

file = {
	"client": 1,
	"url": "/dir/file.txt",
	"node": ["10.10.20.95:3000"]
}

node = ["10.10.20.95:3000", "10.10.20.94:3000"]

*/


var storage,
    config,
    files = [],
    nodes = [];

module.exports = function(_storage, _config) {
	var
	init = function(__storage, __config) 
    {
        this.storage = _storage;
        this.config = _config;
        this.files = [];
        this.nodes = [];
        this.nodeDetail = {};
        this.nodeID = {};

        return this;
	},
	initFiles = function(_files) {
		this.files = _files;
	},
    initNodes = function(_nodes) {
    	this.nodes = _nodes;
    },

    addFile = function(_file) {
		var isExist = false,
			i = -1;

		for(var key in files) {
			if(this.files[key].client == _file.client && this.files[key].url == _file.url) {
				isExist = true;
				break;
			}
		}

		if(!isExist) {
			this.files.push(_file);
		}

		return this;
    },
    removeFile = function(_file) {
		var isExist = false,
			i = -1;

		for(var key in this.files) {
			if(this.files[key].client == _file.client && this.files[key].url == _file.url) {
				this.files.splice(key, 1);
			}
		}

		return this;
	},

	addPath = function(_client, _path, _detail, _abs) {
		var i = -1,
			url = require('url').parse(_path);
		if(url.path.indexOf("/file/") == 0) {
			url.path = url.path.substr(6);
		}

		while(++i < this.files.length && (this.files[i].client != _client || this.files[i].id != _detail.file_id)) {}

		if(i < this.files.length && this.files[i].node.indexOf(url.host) == -1) {
			this.files[i].node.push(url.host);
			(!this.files[i].realpath && (this.files[i].realpath = []));
			this.files[i].realpath.push(_path);
		}
		else if(i >= this.files.length && !_abs) {
			var newFile = {
				"id": _detail.file_id,
				"client": _client,
				"url": _detail.url,
				"md5": _detail.md5 || "",
				"node": []
			};

			this.addFile(newFile).addPath(_client, _path, _detail);
		}

		return this;
	},
	removePath = function(_client, _path) {
		var i = -1,
			url = require('url').parse(_path);
		if(url.path.indexOf("/file/") == 0) {
			url.path = url.path.substr(6);
		}

		while(++i < this.files.length && (this.files[i].client != _client || this.files[i].url != url.path)) {}

		if(!this.files[i]) { return this; }

		while(this.files[i].node.indexOf(url.host) != -1) {
			this.files[i].node.splice( this.files[i].node.indexOf(url.host), 1 );
		}

		return this;
	},

	addNode = function(_node, _detail) {
		if(this.nodes.indexOf(_node) == -1) {
			this.nodes.push(_node);
			this.nodeDetail[_node] = _detail;
			this.nodeID[_detail.id] = _node;
		}
		this.onNode(_node);

		return this;
	},
	removeNode = function(_node) {
		while(this.nodes.indexOf(_node) != -1) {
			this.nodes.splice( this.nodes.indexOf(_node), 1);
		}
		this.offNode(_node);

		return this;
    },
    onNode = function(_node) {
    	var sql = "update supplier_usage set status = 1 where machine_ip = '"+ _node +"'";
    	new require("./queryDB")().queryDB(sql, this.config, function(_err, _result) {/* console.log("[error]:"); console.log(_err); console.log("[result]:"); console.log(_result); */});
    },
    offNode = function(_node) {
    	var sql = "update supplier_usage set status = 0 where machine_ip = '"+ _node +"'";
    	new require("./queryDB")().queryDB(sql, this.config, function(_err, _result) {/* console.log("[error]:"); console.log(_err); console.log("[result]:"); console.log(_result); */});
    },

	avg = function(_arr) {
		var total = 0;
		for(var key in _arr) {
			total += _arr[key];
		}

		return Math.round(total / _arr.length);
	},
	analyze = function(_arr) {
		var result, total = 0, danger = 0, losed = 0;
		for(var key in _arr) {
			total ++;
			_arr[key].danger && danger ++;
			_arr[key].losed && losed ++;
		}

		result = {
			"completeness": Math.round((total - losed) * 100 / total),
			"risk": Math.round(danger * 100 / total),
			"total": total,
			"danger": danger,
			"losed": losed
		};

		return result;
	},

    getfileHealthy = function(_file) {
    	var result = {},
    		rpn = this.config.fileStrategy.replication,
    		count = 0;

    	rpn = rpn > 1? rpn: 1;

    	for(var key in _file.node) {
    		currNode = _file.node[key]
    		if(this.nodes.indexOf(currNode) != -1) {
				count ++;
    		}
    	}

    	result.client = _file.client;
    	result.url = _file.url;
    	result.healthy = Math.round(count / rpn * 100);
    	result.healthy = result.healthy > 100? 100: result.healthy;
    	result.danger = (count == 1);
    	result.losed = (count <= 0);

    	return result;
    },
    getDetailHealthy = function(_client) {
		var result = [],
			rpn = this.config.fileStrategy.replication;

		for(var key in this.files) {
			if(_client && _client != this.files[key].client) continue;
			result.push( this.getfileHealthy(this.files[key]) );
		}

		return result;
	},
	getNodeRisk = function() {
		var result = [],
			tmpResult = {};

		for(var key in this.nodes) {
			!tmpResult[this.nodes[key]] && (tmpResult[this.nodes[key]] = {
				"ip": this.nodes[key],
				"id": this.nodeDetail[ this.nodes[key] ].id,
				"name": this.nodeDetail[ this.nodes[key] ].name,
				"files": [],
				"totalFiles": 0,
				"dangerFiles": 0
			});
		}

		for(var key in this.files) {
			var tmpFile = this.getfileHealthy(this.files[key]);

			for(var kkey = 0; kkey < this.files[key].node.length && !!tmpResult[this.files[key].node[kkey]]; kkey++) {
				var tmpNode = this.files[key].node[kkey];
				tmpResult[tmpNode].files.push(tmpFile);
				tmpResult[tmpNode].totalFiles ++;
				tmpFile.danger && tmpResult[tmpNode].dangerFiles ++;
			}

			//console.log(tmpFile);
		}

		for(var key in tmpResult) {
			result.push({
				"id": tmpResult[key].id,
				"name": tmpResult[key].name,
				"node": key,
				"risk": tmpResult[key].totalFiles > 0 ? Math.round(tmpResult[key].dangerFiles * 100 / tmpResult[key].totalFiles): 0,
				"total": tmpResult[key].totalFiles,
				"danger": tmpResult[key].dangerFiles
			});
		}
		return result;
	},

	getAllFiles = function() {
		return this.files;
	},

	getDangerFiles = function() {
		var result = [];

		for(var key in this.files) {
			// file only in one node && node is online
			var replicationCount = 0,
				replicationPath = [];

			for(var nodeIndex in this.files[key].node) {
				if(this.nodes.indexOf(this.files[key].node[nodeIndex]) != -1) {
					replicationCount ++;
					replicationPath.push("http://" + this.files[key].node[nodeIndex] + "/repair/" + this.files[key].client + "/" + this.files[key].url);
				}
			}

			if(replicationCount == 1) {
				var fullpath = replicationPath[0],
					tmpFile = {
					"client": this.files[key].client,
					"url": this.files[key].url,
					"node": this.files[key].node,
					"fullpath": fullpath
				};

				result.push(tmpFile);
			}
		}

		return result;
	},

	getNodeFileList = function(_node) {
		var result = [];

		if(!_node) { return result; }

		for(var key in this.path) {

		}

		for(var key in this.files) {
			var inNode = false,
				tmpFile = this.files[key];
			for(var k in tmpFile.node) {
				if(_node == tmpFile.node[k] || tmpFile.node[k].indexOf(_node) == 0) {
					inNode = true;
					break;
				}
			}

			if(inNode) {
				for(var k in tmpFile.realpath) {
					var headPath = "http://" + _node + "/file/";
					if(tmpFile.realpath[k].indexOf(headPath) == 0) {
						tmpFile.path = tmpFile.client + "/" + tmpFile.realpath[k].split(headPath)[1];
					}
				}

				result.push(tmpFile);
			}
		}

		return result;
	}

	getSummary = function(_groupby) {
		var result = {},
			stock = {},
			rpn = this.config.fileStrategy.replication;

		for(var key in this.files) {
			if(!result[ [this.files[key][_groupby]] ]) {
				result[ [this.files[key][_groupby]] ] = [];
				stock[ [this.files[key][_groupby]] ] = [];
			}
			result[ [this.files[key][_groupby]] ].push( this.getfileHealthy(this.files[key]).healthy );
			stock[ [this.files[key][_groupby]] ].push( this.getfileHealthy(this.files[key]) );
		}

		for(var key in result) {
			var tmpAnalyze = this.analyze(stock[key]);

			result[key] = {
				"healthy": this.avg(result[key]),
				"completeness": tmpAnalyze.completeness,
				"risk": tmpAnalyze.risk,
				"total": tmpAnalyze.total,
				"danger": tmpAnalyze.danger,
				"losed": tmpAnalyze.losed
			};
		}

		return result;
    },
    
    that = {
    	init: init,
    	initFiles: initFiles,
		initNodes: initNodes,
		addFile: addFile,
		removeFile: removeFile,
		addPath: addPath,
		removePath: removePath,
		addNode: addNode,
		onNode: onNode,
		offNode: offNode,
		removeNode: removeNode,
		avg: avg,
		analyze: analyze,
		getfileHealthy: getfileHealthy,
		getDetailHealthy: getDetailHealthy,
		getNodeRisk: getNodeRisk,
		getAllFiles: getAllFiles,
		getDangerFiles: getDangerFiles,
		getNodeFileList: getNodeFileList,
		getSummary: getSummary
    };

    return that.init(_storage, _config);
};