var config,
	tools = require("./function"),
	db = new require("./queryDB")();

module.exports = {
	init: function(_storage, _config) {
		storage = _storage;
		config = _config;
		return this;
	}
	, create: function(_callback) {
		var todo = 4,
			result = {},
			finish = function(_e, _data) {
				if(_e) {
					_callback(_e);
				}
				else {
					todo--;
					for(var key in _data) {
						result[key] = _data[key];
					}

					if(todo <= 0) {
						_callback(false, module.exports.parseData(result));
					}
				}
			};

		module.exports.initNode(finish);
		module.exports.initFile(finish);
		module.exports.initPath(finish);
		finish(false);
	}
	, initNode: function(_callback) {
		var sql = module.exports.sqlTranslate("selectNode");
		db.queryDB(sql, config, function(_err, _results) {
			var data = {};
			if(_err) {
				_callback(_err);
			}
			else {
				for(var key in _results.rows) {
					data[_results.rows[key]["id"]] = _results.rows[key];
				}
			}

			_callback(false, {"nodes": data});
		});
	}
	, initFile: function(_callback) {
		var sql = module.exports.sqlTranslate("selectFile");
		db.queryDB(sql, config, function(_err, _results) {
			var data = {};
			if(_err) {
				_callback(_err);
			}
			else {
				for(var key in _results.rows) {
					data[_results.rows[key]["file_id"]] = _results.rows[key];
				}
			}

			_callback(false, {"files": data});
		});
	}
	, initPath: function(_callback) {
		var sql = module.exports.sqlTranslate("selectPath");
		db.queryDB(sql, config, function(_err, _results) {
			var data = [];
			if(_err) {
				_callback(_err);
			}
			else {
				for(var key in _results.rows) {
					data.push(_results.rows[key]);
				}
			}

			_callback(false, {"paths": data});
		});
	}
	, parseData: function(_data) {
		var m = new require("./fileHealthy.js")(storage, config);
		for(var key in _data.nodes) {
			m.addNode(_data.nodes[key].machine_ip, _data.nodes[key]);
		}
		for(var key in _data.files) {
			m.addFile({"id": _data.files[key].file_id, "client": _data.files[key].client_id, "url": _data.files[key].file_name, "md5": _data.files[key].md5, "node":[]});
		}
		for(var key in _data.paths) {
			var fileID = _data.paths[key].file_id,
				file = _data.files[ fileID ],
				nodeID = _data.paths[key].machine_id,
				node = _data.nodes[ nodeID ];

			if(!!file && !!node) {
				var clientID = _data.files[ fileID ].client_id,
				//	path = "http://" + _data.nodes[ nodeID ].machine_ip + "/file/" + _data.files[ fileID ].file_name;
					path = _data.paths[key].file_path,
					detail = _data.paths[key];

				// console.log("##### " + clientID + " - " + path);
				m.addPath(clientID, path, detail, true);
			}
		}

		return m;
	}
	, sqlTranslate: function(_method) {
		var template, sql;
		if(!_method) {
			_method = "selectNode";
		}

		switch(_method) {
			case "selectNode":
                template = "select u.id, u.machine_ip, i.name " +
                           " from supplier_usage u inner join supplier_info i on u.supplier_id = i.supplier_id " +
                           " where u.status = 1 ";

                sql = template;
                return sql;
				break;

			case "selectFile":
				template = "select file_id, client_id, file_name, md5 " +
						   " from file_info " +
						   " where status = 1 and type = 1 and isdir = false";

				sql = template;
				return sql;
				break;

			case "selectPath":
				template = "select distinct file_id, machine_id, file_path " +
						   " from file_path " +
						   " where status = 1 order by file_id, machine_id";

				sql = template;
				return sql;
				break;

			default:
				return sql;
				break;
		}
	}
}