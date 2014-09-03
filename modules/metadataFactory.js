var config,
    recursive = false,
    tools = require("./function"),
    db = new require("./queryDB")(),
    cMetadata = require("./metadata"),
    cRealpath = require("./realpath");

module.exports = {
    init: function(_config) 
    {
        //console.log("##### metadataFactory.init #####");
        config = _config;
        return this;
    }
    , safeString: function(_string) {
        !_string && (_string = "");
        return _string.split("'").join("");
    }
    , create: function(_metadata, _clientId) {
        //console.log("##### metadataFactory.create #####");
        _metadata.client_id = _metadata.client_id || _clientId;
        _metadata.replication = _metadata.replication || config.fileStrategy.replication;
        _metadata.type = _metadata.file_type;

        rtMeta = new cMetadata(_metadata);
        rtMeta.save = function(__callBack) {
            module.exports.save(this, __callBack);
        };
        rtMeta.remove = function(__callBack) {
            module.exports.remove(this, __callBack);
        };
        //console.log("##### metadataFactory.create [END] #####");
        return rtMeta;
    }
    , list: function(_metadata, _callBack) {
        //console.log("##### metadataFactory.list #####");
        var sql = module.exports.sqlTranslate(_metadata, "list");

        db.queryDB(sql, config, function(_err, _result) {
            _callBack(_err, _result);
        });
    }
    , load: function(_metadata, _clientId, _callBack) {
        //console.log("##### metadataFactory.load #####");
        if(typeof(_metadata) == "string") {
            _metadata = {
                path: _metadata
            };
        }
        //console.log("##### metadataFactory.load " + _metadata.path + " #####");

        _metadata.client_id = _clientId;
        _metadata.replication = config.fileStrategy.replication;

        var _path = _metadata.path,
            client_id = _metadata.client_id,
            file_name = _path,

            sql = module.exports.sqlTranslate(_metadata, "select"),

        parseMeta = function (row) {
            //console.log("##### metadataFactory.parseMeta #####");
            var tmpdata = {
                "strategy": config.fileStrategy,
                "file_id": row.file_id,
                "client_id": row.client_id,
                "file_name": row.file_name,
                "status": row.status,
                "isdir": row.isdir,
                "partof": row.partof,
                "part": row.part,
                "bytes": row.bytes,
                "replication": row.replication,
                "division": row.division,
                "md5": row.md5,
                "uuid": row.uuid,
                "type": row.file_type,
                "encrypt": row.encrypt,

                "checkin_time": row.checkin_time,
                "modified": row.modified
            },
            rtMeta = module.exports.create(tmpdata, client_id);

            return rtMeta;
        },
        loadMeta = function(_sql, __callBack) {
            //console.log("##### metadataFactory.load.loadMeta #####");
            db.queryDB(_sql, config, function(_err, _results) {
                // something wrong
                if(_err) {
                    console.log(">>>>> MetadataFactory.loadMeta error");
                    console.log(_err);
                    __callBack && __callBack(_err);
                }
                // get data
                else if(_results.rowCount > 0) {
                    var metadata = parseMeta(_results.rows[0]),
                        todo = 1,
                        done = function(_err) {
                            if(--todo <= 0) {
                                __callBack && __callBack(false, metadata);
                            }
                        };

                    if(!metadata.isDir()) {
                        todo++;
                        loadRealpaths(metadata, done);
                    }

                    if((!metadata.isPart() || recursive) && !metadata.isDir()) {
                        todo++;                  
                        loadPart(metadata, done);
                    }

                    done();
                }
                // no data
                else if(!_metadata.path) {
                    console.log("no such realpath");
                    __callBack && __callBack(false, false);
                }
                else {
                    // 無資料則建立新 metadata
                    var newMeta = module.exports.create(_metadata, _metadata.client_id);
                    __callBack && __callBack(false, newMeta);
                }
            });
        },
        loadPart = function(_metadata, __callBack) {
            //console.log("##### metadataFactory.load.loadPart #####");
            var _sql = module.exports.sqlTranslate(_metadata, "selectPart");
            db.queryDB(_sql, config, function(_err, _results) {
                // something wrong
                if(_err) {
                    console.log(">>>>> MetadataFactory.loadPart error");
                    console.log(_err);
                    __callBack(_err);
                }
                // get data
                else if(_results.rowCount > 0) {
                    var todo = 1 + _results.rowCount,
                        done = function() {
                            if(--todo <= 0) {
                                __callBack(false, _metadata);
                            }
                        };

                    for(var key in _results.rows) {
                        var currPart = parseMeta(_results.rows[key]);
                        _metadata.addPart(currPart);

                        loadRealpaths(currPart, done);
                        if(recursive) {
                            todo ++;                  
                            loadPart(currPart, done);
                        }
                    }

                    done();
                }
                // no data
                else {
                    __callBack();
                }
            });
        },
        loadRealpaths = function(_metadata, __callBack) {
            //console.log("##### metadataFactory.load.loadRealpaths #####");
            var _sql = module.exports.sqlTranslate(_metadata, "selectRealpath");

            db.queryDB(_sql, config, function(_err, _results) {

                // something wrong
                if(_err) {
                    console.log(">>>>> MetadataFactory.loadRealpaths error");
                    console.log(_err);
                    __callBack(_err);
                }
                // get data
                else if(_results.rowCount > 0) {
                    var todo = 1 + _results.rowCount,
                        done = function() {
                            if(--todo <= 0) {
                                __callBack(false, _metadata);
                            }
                        };

                    for(var key in _results.rows) {
                    	// if md5 is dirty -> set status = 0 (need to reUpload)
                        var currRealpath = new cRealpath(_results.rows[key]);

                        currRealpath.save = function(___callBack) {
                            module.exports.saveRealPath(currRealpath, ___callBack);
                        };
                        currRealpath.remove = function(___callBack) {
                            module.exports.removeRealPath(currRealpath, ___callBack);
                        };
                        _metadata.addRealPath(currRealpath);
                        done();
                    }

                    done();
                }
                // no data
                else {
                    __callBack(false, _metadata);
                }
            });
        };

        loadMeta(sql, _callBack);
    }
    , saveParentFolder: function(_metadata, _callBack) {
        //console.log("##### metadataFactory.saveParentFolder #####");
        var clientId = _metadata.getValue("client_id"),
            name = _metadata.getValue("file_name"),
            tmpFolder = name.substr(0, name.lastIndexOf("/")),
            folder = (name.lastIndexOf("/") + 1 == name.length)? tmpFolder.substr(0, tmpFolder.lastIndexOf("/") +1): name.substr(0, name.lastIndexOf("/") +1),
            tmpJSON;

        if(folder.length == 0) {
            console.log("##### metadataFactory.saveParentFolder [END] #####");
            _callBack(false, false);
            return false;
        }
        else {
            tmpJSON = {
                "client_id": clientId,
                "path": folder,
                "file_name": folder,
                "status": 1,
                "isdir": true,
                "type": 0,
                "bytes": 0
            };
            module.exports.load(tmpJSON, clientId, function(_err, _result) {
                //console.log("##### metadataFactory.saveParentFolder: "+ folder +" [END] #####");
                _result.save(_callBack);
            });
        }
    }
    , save: function(_metadata, _callBack) {
        //console.log("##### metadataFactory.save #####");

        // 無 id -> create
        // 有 id -> update
        // for (parts) -> savePart
        var ID = _metadata.getId(),
            method,
            sql;

        if(!_metadata.isNew()) {
            method = "update";
        }
        else {
           method = "insert";
        }

        var afterSave = function(_err, _result) {
            //console.log("##### metadataFactory.save.afterSave #####");
            var finish = 1,
                currResult = [],
                toCancel = false,
                cancel = function() {
                    if(toCancel && finish < 0) {
                        console.log("cancel");
                    }
                },
                done = function(__err, __result) {

                    finish --;

                    if(__err) {
                        toCancel = true;
                        _callBack && _callBack(err);
                    }
                    else {
                        if(__result.length) {
                            for(var key in __result) {
                                currResult.push(__result[key]);
                            }
                        }
                        else {
                            currResult.push(__result);
                        }
                        
                        if(finish <= 0 && !toCancel) {
                            //console.log("##### metadataFactory.save " + _metadata.getValue("file_name") + " [END] #####");
                            _callBack && _callBack(false, _metadata);
                        }
                    }
                    cancel();
                };

            if(_err) {
                console.log(_err);
                _callBack && _callBack(_err);
                return;
            }
            else {
                _result && currResult.push(_result);
                _result && (_result.rowCount > 0) && _result.rows[0] && _result.rows[0].file_id && _metadata.setId(_result.rows[0].file_id);

                if(!_metadata.isPart()) {
                    finish++;
                    module.exports.saveParentFolder(_metadata, done);
                }
                for(var key in _metadata.realpaths) {
                    finish++;
                    // console.log(_metadata.realpaths[key]);
                    module.exports.saveRealPath(_metadata.realpaths[key], done);
                }
                for(var key in _metadata.files) {
                    finish++;
                    // console.log(_metadata.files[key]);
                    module.exports.save(_metadata.files[key], done);
                }
                done(false, _result);
            }
        };

        if(!_metadata.isDirty()) {
            afterSave(false, false);
        }
        else {
            sql = module.exports.sqlTranslate(_metadata, method);

            // @@-- 儲存失敗時需要全數刪除
            db.queryDB(sql, config, afterSave);
        }
    }
    , saveRealPath: function(_realpath, _callBack) {
        //console.log("##### metadataFactory.saveRealPath #####");
        if(!_realpath.isDirty()) {
            _callBack(false, false);
            return;
        }

        var rp = _realpath,
            method, sql;

        if(rp.isNew()) {
            method = "insertRealPath";
        }
        else {
            method = "updateRealPath";
        }
        sql = module.exports.sqlTranslate(_realpath, method);

        db.queryDB(sql, config, function(_err, _result) {
            if(_err) {
                _callBack(_err);
            }
            else {
                if(_result && _result.rowCount > 0 && _result.rows[0] && _result.rows[0].file_path_id) {
                    var id = _result.rows[0].file_path_id;
                    _realpath.setId(id);
                }
                _callBack(false, _result.rows);
            }

            //console.log("##### metadataFactory.saveRealPath [END] #####");
        });
    }
    , remove: function(_metadata, _callBack) {
        //console.log("##### metadataFactory.remove #####");
        // remove parts -> remove realpaths -> remove this
        // 出現錯誤需 roll back
        var predo = 1 + _metadata.files.length + _metadata.realpaths.length,
            todo = 1,
            toRollBack = false,
            result,
            predone = function(_err, _result) {
                if(_err) {
                    toRollBack = true;
                }

                if(--predo <= 0 && !toRollBack) {
                    removeThis(_metadata, done);
                }

                if(predo <= 0 && toRollBack) {
                    rollBack();
                }
            },
            removeThis = function(__metadata, __callBack) {
                var sql = module.exports.sqlTranslate(__metadata, "delete");
                db.queryDB(sql, config, __callBack);
            },
            done = function(_err, _result) {
                if(_err) {
                    toRollBack = true;
                }

                if(--todo <= 0 && !toRollBack) {
                    _metadata.setId();
                    _callBack && _callBack(false, _result);
                }

                if(todo <= 0 && toRollBack) {
                    rollBack();
                }
            },
            rollBack = function() {};

        for(var key in _metadata.files) {
            module.exports.remove(_metadata.files[key], predone);
        }

        for(var key in _metadata.realpaths) {
            module.exports.removeRealpath(_metadata.realpaths[key], predone);
        }

        predone();

    }
    , removeRealpath: function(_realpath, _callBack) {
        //console.log("##### metadataFactory.removeRealpath #####");
        var sql = module.exports.sqlTranslate(_realpath, "deleteRealpath");

        db.queryDB(sql, config, function(_err, _result) {
            _realpath.setId();
            _callBack(_err, _result);
        });
    }

    , sqlTranslate: function(_metadata, _method) {
        var template, sql;
        if(_metadata.isPart && _metadata.isPart()) {
            _method += "Part";
        }
        else if(_metadata.isRealpath) {
            _method += "FromRealpath";
        }

        switch(_method) {
            case "insert":
                template = "insert into file_info(client_id, file_name, checkin_time, status, replication, division, isdir, type, bytes, md5, uuid, file_type, encrypt) " +
                          " values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s') " + 
                          " returning file_id";

                sql = tools.sprintf(template, 
                                    _metadata.getValue("client_id"),
                                    _metadata.getValue("file_name"),
                                    _metadata.getValue("checkin_time"),
                                    _metadata.getValue("status"),
                                    _metadata.getValue("replication"),
                                    _metadata.getValue("division"),
                                    _metadata.getValue("isdir"),
                                    _metadata.getValue("type"),
                                    _metadata.getValue("bytes"),
                                    _metadata.getValue("md5"),
                                    _metadata.getValue("uuid"),
                                    _metadata.getValue("file_type"),
                                    _metadata.getValue("encrypt"));
                break;
            case "insertPart":
                template = "insert into file_info(client_id, file_name, checkin_time, status, replication, division, isdir, type, bytes, md5, uuid, partof, part, file_type, encrypt) " +
                          " values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s') " + 
                          " returning file_id";

                sql = tools.sprintf(template, 
                                    _metadata.getValue("client_id"),
                                    _metadata.getValue("file_name"),
                                    _metadata.getValue("checkin_time"),
                                    _metadata.getValue("status"),
                                    _metadata.getValue("replication"),
                                    _metadata.getValue("division"),
                                    _metadata.getValue("isdir"),
                                    _metadata.getValue("type"),
                                    _metadata.getValue("bytes"),
                                    _metadata.getValue("md5"),
                                    _metadata.getValue("uuid"),
                                    _metadata.getValue("partof"),
                                    _metadata.getValue("part"),
                                    _metadata.getValue("file_type"),
                                    _metadata.getValue("encrypt"));
                break;
            case "insertRealPath":
            case "insertRealPathPart":
                template = "insert into file_path(file_id, file_path, supplier_id, machine_id, status) " +
                           " values(%s, '%s', %s, %s, %s) " +
                           " returning file_path_id";

                sql = tools.sprintf(template,
                                    _metadata._meta.file_id,
                                    _metadata._meta.file_path,
                                    _metadata._meta.supplier_id,
                                    _metadata._meta.machine_id,
                                    _metadata._meta.status);
                break;
            case "select":
                template = "select fi.file_id, fi.client_id, fi.file_name, fi.checkin_time, fi.status, fi.replication, fi.division, fi.isdir, fi.type, fi.bytes, fi.modified, fi.md5, fi.uuid, fi.partof, fi.part, fi.file_type, fi.encrypt " +
                           " from file_info fi " +
                           " where fi.status != 3 and fi.client_id = '%s' and fi.file_name = '%s' ";

                sql = tools.sprintf(template, 
                                    _metadata.client_id, 
                                    module.exports.safeString(_metadata.path));
                break;
            case "selectPart": 
                template = "select fp.file_id, fp.client_id, fp.file_name, fp.checkin_time, fp.status, fp.replication, fp.division, fp.isdir, fp.type, fp.bytes, fp.modified, fp.md5, fp.uuid, fp.partof, fp.part, fp.file_type, fp.encrypt " +
                           " from file_info fp " +
                           " where fp.status != 3 and fp.client_id = '%s' and fp.partof = '%s' ";

                sql = tools.sprintf(template, 
                                    _metadata._meta.client_id, 
                                    _metadata._meta.file_id);
                break;
            case "selectFromRealpath":
                template = "select fi.file_id, fi.client_id, fi.file_name, fi.checkin_time, fi.status, fi.replication, fi.division, fi.isdir, fi.type, fi.bytes, fi.modified, fi.md5, fi.uuid, fi.partof, fi.part, fi.file_type, fi.encrypt " +
                           " from file_info fi inner join file_path fp on fi.file_id = fp.file_id " +
                           " where fi.status != 3 and fp.file_path like '%/%s' ";

                sql = tools.sprintf(template,
                                    module.exports.safeString(_metadata.realpath));
                break;
            case "selectCurrentRealpath":
                template = "select frp.file_path_id, frp.file_id, frp.file_path, frp.supplier_id, frp.machine_id, frp.status " +
                           " from file_path frp " +
                           " where frp.status != 3 and frp.file_path = '%s'";
                sql = tools.sprintf(template,
                                    _metadata._meta.realpath);
                break;
            case "selectRealpath":
            case "selectRealpathPart":
                template = "select frp.file_path_id, frp.file_id, frp.file_path, frp.supplier_id, frp.machine_id, frp.status " +
                           " from file_path frp " +
                           " where frp.status != 3 and frp.file_id = '%s'";

                sql = tools.sprintf(template,
                                    _metadata._meta.file_id);
                break;
            case "update":
            case "updatePart":
                if(_metadata.dirtyKeys.length == 0) {　break; }

                template = "update file_info set %s where file_id = '%s'";
                var subtemplateS = "%s = '%s'",
                    subtemplateD = "%s = %s",
                    unique = [],
                    values = [],
                    modifiedTime = false;

                for(var key in _metadata.dirtyKeys) {
                    var currKey = _metadata.dirtyKeys[key],
                        currValue = _metadata.getValue(currKey),
                        currKV;
                    if(unique.indexOf(currKey) > -1) {
                        continue;
                    }
                    else {
                        unique.push(currKey);
                    }

                    if(currKey == "modified") { modifiedTime = true; }

                    if(typeof(currValue) == "string") {
                        currKV = tools.sprintf(subtemplateS, currKey, currValue);
                    }
                    else {
                        currKV = tools.sprintf(subtemplateD, currKey, currValue);
                    }

                    values.push(currKV);
                }
                !modifiedTime && values.push(tools.sprintf(subtemplateD, "modified", Math.floor(new Date() / 1000)));

                sql = tools.sprintf(template, values.join(", "), _metadata.getId());

                break;
            case "updateRealPath":
            case "updateRealPathPart":
                if(_metadata.dirtyKeys.length == 0) { break; }

                template = "update file_path set %s where file_path_id = '%s'";
                var subtemplateS = "%s = '%s'",
                    subtemplateD = "%s = %s",
                    unique = [],
                    values = [];

                for(var key in _metadata.dirtyKeys) {
                    var currKey = _metadata.dirtyKeys[key],
                        currValue = _metadata.getValue(currKey),
                        currKV;
                    if(unique.indexOf(currKey) > -1) {
                        continue;
                    }
                    else {
                        unique.push(currKey);
                    }

                    if(typeof(currValue) == "string") {
                        currKV = tools.sprintf(subtemplateS, currKey, currValue);
                    }
                    else {
                        currKV = tools.sprintf(subtemplateD, currKey, currValue);
                    }

                    values.push(currKV);
                }
                values.push(tools.sprintf(subtemplateD, "modified", Math.floor(new Date() / 1000)));

                sql = tools.sprintf(template, values.join(", "), _metadata.getId());

                break;
            case "delete":
            case "deletePart":
                template = "delete from file_info " +
                           " where file_id = '%s'";

                sql = tools.sprintf(template,
                                    _metadata.getId());
                break;
            case "deleteRealpath":
            case "deleteRealpathPart": 
                template = "delete from file_path " +
                           " where file_path_id = '%s'";

                sql = tools.sprintf(template,
                                    _metadata.getId());
                break;
            case "checkFolder":
                template = "select fi.file_id, fi.client_id, fi.file_name, fi.checkin_time, fi.status, fi.replication, fi.division, fi.isdir, fi.type, fi.bytes, fi.modified, fi.md5, fi.uuid, fi.partof, fi.part, fi.file_type " +
                           " from file_info fi " +
                           " where fi.status != 3 and fi.client_id = '%s' and fi.file_name = '%s' ";

                sql = tools.sprintf(template, 
                                    _metadata.client_id, 
                                    _metadata.path);
            case "list":
                template = "select file_name, bytes, file_type " +
                           " from file_info " +
                           " where client_id = %s and partof is null and status = 1";

                sql = tools.sprintf(template, 
                                    _metadata.client_id);
            default: 
                break;
        }
if(_method.indexOf("update") > -1)console.log(sql);
// console.log(_method);
        return sql;
    }
};