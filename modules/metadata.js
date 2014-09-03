/* metadata
{
  "isdir": false,
  "ispart": false,
  "uuid": "ef4aa542-62aa-458c-8396-fa6ccf024b18",
  "path": "pic1/download.jpg",
  "bytes":13795,
  "modified":"2013-06-04T15:12:53.501517",
  "md5":"4d4984748243200fc98fe4b5fa274b30",
  "files":[
    {
      "uuid":"xxxx-xxxx-001",
      "part":1,
      "md5":"1b7598e690aa16a956af2a27999d84bc",
      "path": "10.10.20.96"
    },
    {
      "uuid":"xxxx-xxxx-002",
      "part":0,
      "md5":"f53f2863f0cb8a3bd54c52d5300a3961",
      "path": "10.10.20.96"
    }
  ]
}
 */

module.exports = function(_metadata) {
	// keys 為開放更改的參數
    var keys = ["client_id", "file_name", "checkin_time", "status", "replication", "division", "isdir", "type", "bytes", "modified", "md5", "uuid", "partof", "part", "file_type", "encrypt"]

    , init = function(_metadata) {
    	this.keys = keys;
	    this.dirtyKeys = [];
	    this.files = [];
	    this.realpaths = [];
	    this.indexOfPart = {};

    	if(_metadata.file_id > -1) {
			this.id = _metadata.file_id;
	        this._meta = _metadata;
	        this._meta.ispart = (this._meta.partof != null);
	    }
	    else {
	    	this._meta = {
	    		"client_id": _metadata.client_id, 
	    		"file_name": _metadata.path, 
	    		"checkin_time": Math.floor(new Date() / 1000), 
	    		"status": _metadata.status || 0, 
	    		"replication": _metadata.replication, 
	    		"division": _metadata.division, 
	    		"isdir": ((_metadata.path.lastIndexOf("/") + 1) == _metadata.path.length), 
	    		"ispart": (_metadata.partof > -1),
	    		"part": _metadata.part,
	    		"type": (_metadata.files && _metadata.files.length > 0)? 0: 1, 
                "file_type": ((_metadata.path.lastIndexOf("/") + 1) == _metadata.path.length)? "folder": _metadata.type,
	    		"bytes": _metadata.bytes || 0, 
	    		"md5": _metadata.md5, 
	    		"uuid": _metadata.uuid,
	    		"encrypt": !!_metadata.encrypt
	    	};

            var updateTime = parseInt(_metadata.modified);
            if(!!updateTime) {
                this._meta.modified = updateTime;
            }
    	
	    	for(var key in _metadata.files) {
	    		var tmpMeta = _metadata.files[key];
                if(!tmpMeta.path && tmpMeta.uuid) {
                    tmpMeta.path = tmpMeta.uuid;
                }
                else if(!tmpMeta.path && !tmpMeta.uuid) {
                    tmpMeta.path = this._meta.file_name + ".part." + _metadata.files[key].part;
                }
	    		tmpMeta.client_id = _metadata.client_id;
	    		tmpMeta.replication = _metadata.replication;
	    		this.addPart(new module.exports(tmpMeta));
	    	}

	    	this._meta.division = this.files.length;
	    }

        return this;
    }

    , setId = function(_id) {
    	this.id = _id;
    	for(var key in this.realpaths) {
    		this.realpaths[key].setFileId(_id);
            this.realpaths[key].pathReset(this.generatePath());
    	}
    	for(var key in this.files) {
    		this.files[key].setPartOf(_id);
    	}

    	return this;
    }
    , getId = function() {
        return this.id;
    }
    , setClientId = function(_clientId) {
    	this._meta.client_id = _clientId;
    	for(var key in this.files) {
    		this.files[key].setClientId(_clientId);
    	}

    	return this;
    }
    , setStatus = function(_status) {
        switch(_status) {
            case 3:
            case "3":
                var myPaths = this.getRealPath(),
                    myParts = this.getPart();

                for(var key in myPaths) {
                    myPaths[key].setStatus(3);
                }

                for(var key in myParts) {
                    myParts[key].setStatus(3);
                }

                this._meta.status = 3;
                break;
            case 2:
            case "2":
                this._meta.status = 2;
                break;
            case 1:
            case "1":
                this._meta.status = 1;
                break;
            case 0:
            case "0":
                this._meta.status = 0;
            default:
                break;
        }
        this.dirtyKeys.push("status");

        return this;
    }
    , getKeys = function() {
    	return this.keys;
    }
    , getDirty = function() {
    	var rtdata = {};
    	for(var key in this.dirtyKeys) {
    		rtdata[this.dirtyKeys[key]] = this._meta[this.dirtyKeys[key]];
    	}

    	return rtdata;
    }
    , md5Dirty = function() {
    	return !(this.dirtyKeys.indexOf("md5") == -1)
    }
    , update = function(_data) {
    	console.log("##### metadata.update #####");

    	!_data && (_data = {});
    	for(var key in _data) {
    		this.setValue(key, _data[key]);
    	}

        if(_data.files) {
            var totalParts = this.getPart().length;
            var isDirty = (_data.files.length > 0 && totalParts != _data.files.length);

            // 1 part different, all parts reset
            for(var key in _data.files) {
                if(isDirty) {
                    break;
                }
                var tmpPart = _data.files[key];
                var oldMD5 = this.getPart(tmpPart.part).getValue("md5");
                if(tmpPart.md5 != oldMD5) {
                    isDirty = true;
                    break;
                }
            }

            if(isDirty) {
                this.updatePart(_data.files);
            }
        }
    }
    , setValue = function(_key, _value) {
		if(this.keys.indexOf(_key) > -1 && this._meta[_key] != _value) {
			this._meta[_key] = _value;
			this.dirtyKeys.push(_key);
		}

		if(_key == "md5") {
			this.resetFile();
		}

		return this;
    }
    , resetFile = function() {
		var pathList = this.getRealPath();
		for(var key in pathList) {
			pathList[key].setStatus(0);
		}
    }
    , getValue = function(_key) {
    	if(this.keys.indexOf(_key) > -1 && typeof(this._meta[_key]) != "undefined" ) {
    		return this._meta[_key];
    	}
    	else {
    		return "";
    	}
    }
    , setPartOf = function(_partOf) {
    	this._meta.partof = _partOf;

    	return this;
    }
    , isPart = function() {
        return (this._meta.partof && this._meta.partof > -1) || (this._meta.part > 0) || (this._meta.part == 0);
    }
    , isDir = function(_bool) {
        if(typeof(_bool) != "undefined") {
            this._meta.isdir = _bool;
            return true;
        }
        else {
            return this._meta.isdir;
        }
    }
    , isNew = function() {
    	return !(typeof(this.id) == "number");
    }
    , isDirty = function() {
    	return !(typeof(this.id) == "number") || this.dirtyKeys.length > 0;
    }
    , addPart = function(_part) {
    	var partNum = _part.getValue("part");
        _part.setPartOf(this.getId());
        this.files.push(_part);
        this.indexOfPart[partNum] = this.files.indexOf(_part);
        this._meta.division = this.files.length;

        return this;
    }
    , getPart = function(_partNum) {
    	if(typeof(_partNum) == "undefined") {
    		return this.files;
    	}
    	else {
    		return this.files[this.indexOfPart[_partNum]];
    	}
    }
    , updatePart = function(_files) {
        this.deletePart();
        for(var key in _files) {
            var tmpMeta = _files[key];
            if(!tmpMeta.path && tmpMeta.uuid) {
                tmpMeta.path = tmpMeta.uuid;
            }
            else if(!tmpMeta.path && !tmpMeta.uuid) {
                tmpMeta.path = this._meta.file_name + ".part." + _files[key].part;
            }
            tmpMeta.client_id = this._meta.client_id;
            tmpMeta.replication = this._meta.replication;
            this.addPart(new module.exports(tmpMeta));
        }

        return this;
    }
    , deletePart = function(_partNum) {
        var parts = this.getPart(_partNum);
        if(parts && parts.length) {
            for(var key in parts) {
                parts[key].setStatus(3);
            }
        }
        else if(parts && parts.setStatus) {
            parts.setStatus(3);
        }

        return this;
    }

    , generatePath = function() {
        var tmpId = (this.id || '').toString();
        console.log(">>>>> "+tmpId);
        return require('crypto').createHmac('sha1', '').update(tmpId).digest().toString('hex');
    }
	, addRealPath = function(_realpath) {
		var id, isExist = false;

        if(typeof(_realpath) == "string") {

        }

		if(id = this.getId()) {
			_realpath.setFileId(id);
		}

		var pathList = this.getRealPath();
		for(var key in pathList) {
			if(pathList[key].getValue("file_path") == _realpath.getValue("file_path")) {
				return this;
			}
		}

		this.realpaths.push(_realpath);
		return this;
	}
	, getRealPath = function(_select) {
		var rtdata = this.realpaths;

		if(_select = parseInt(_select) || (_select == 0)) {
			_select = _select % rtdata.length;
			return rtdata[_select];
		}
		else {
			return rtdata;
		}
	}
	, getReadyPath = function(_select) {
		var rtdata = [];
		for(var key in this.realpaths) {
			if(this.realpaths[key].isReady()) {
				rtdata.push(this.realpaths[key]);
			}
		}

		if(_select = parseInt(_select) || (_select == 0)) {
			_select = _select % rtdata.length;
			return rtdata[_select];
		}
		else {
			return rtdata;
		}
	}
    , getReadyPathSimple = function(_select) {
        var rtdata = [];
        for(var key in this.realpaths) {
            if(this.realpaths[key].isReady()) {
                rtdata.push(this.realpaths[key].getValue("file_path"));
            }
        }

        if(_select = parseInt(_select) || (_select == 0)) {
            _select = _select % rtdata.length;
            return rtdata[_select];
        }
        else {
            return rtdata;
        }
    }
	, getUnreadyPath = function(_select) {
		var rtdata = [];
		for(var key in this.realpaths) {
			if(!this.realpaths[key].isReady()) {
				rtdata.push(this.realpaths[key]);
			}
		}

		if(_select = parseInt(_select) || (_select == 0)) {
			_select = _select % rtdata.length;
			return rtdata[_select];
		}
		else {
			return rtdata;
		}
	}
    , getUploadPath = function(_select) {
        var rtdata = [],
            myPart = this.getPart();
        for(var key in this.realpaths) {
            if(!this.realpaths[key].isReady()) {
                var tmpPath = {
                    "uuid": this.getValue("uuid"),
                    "part": this.getValue("part"),
                    "md5": this.getValue("md5"),
                    "encrypt": this.getValue("encrypt"),
                    "path": this.realpaths[key].getValue("file_path")
                };

                rtdata.push(tmpPath);
            }
        }

        // 載入 part 路徑
        for(var key in myPart) {
            var tmpPathArr = myPart[key].getUploadPath();
            for(var kkey in tmpPathArr) {
                rtdata.push(tmpPathArr[kkey]);
            }
        }

        return rtdata;
    }
    , getDuplicationPath = function() {
        var isReady = false,
            rtdata = {from: null, to: [], clientId: this.getValue("client_id")},
            myPart = this.getPart();

        for(var key in this.realpaths) {
            if(!this.realpaths[key].isReady()) {
                rtdata.to.push(this.realpaths[key].getValue("file_path"));
            }
            else {
                isReady = true;
                rtdata.from = this.realpaths[key].getValue("file_path");
            }
        }

        return isReady? rtdata: false;
    }
    , getEmptyPathCount = function() {
        var rtdata = 0,
            myParts = this.getPart(),
            myPaths = this.getRealPath();

        if(myParts.length > 0) {
            for(var key in myParts) {
                rtdata += myParts[key].getEmptyPathCount();
            }
        }
        else {
            if(myPaths.length == 0) {
                rtdata ++;
            }
        }

        return rtdata;
    }
    , getEmptyFile = function() {
        var rtdata = 0,
            myParts = this.getPart(),
            myPaths = this.getRealPath(),
            emptyCount = this.getEmptyPathCount();

        if(emptyCount > 0 && myParts.length > 0) {
            for(var key in myParts) {
                if(myParts[key].getEmptyPathCount() > 0) {
                    return myParts[key].getEmptyFile();
                }
            }
        }
        else if(emptyCount > 0) {
            return this;
        }
        else {
            return false;
        }
    }
    , toJSON = function(_full) {
        var rtdata;
        if(this.isPart() && !_full) {
            rtdata = {
                "uuid": this._meta.uuid,
                "part": this._meta.part,
                "md5": this._meta.md5,
                "path": this._meta.file_name,      		// path = file_name
                "status": this.getValue("status"),
                "realpath": this.getReadyPathSimple(1),
                "encrypt": this._meta.encrypt
            };
        }
        else {
            var modified = this._meta.modified > 0? this._meta.modified: this._meta.checkin_time;
            rtdata = {
                "isdir": this._meta.isdir,
                "ispart": this.isPart(),
                "uuid": this._meta.uuid,
                "path": this._meta.file_name,           // path = file_name
                "bytes": this._meta.bytes,
                "md5": this._meta.md5,
                "created": this._meta.checkin_time,
                "modified": modified,
                "status": this.getValue("status"),
                "realpath": this.getReadyPathSimple(1),
                "encrypt": this._meta.encrypt
            };
        }

        if(this.files.length > 0) {
            rtdata.files = [];

            for(var key in this.files) {
            	rtdata.files.push(this.files[key].toJSON());
        	}
        }

        if(false && this.realpaths.length > 0) {
            rtdata.realpaths = [];

            for(var key in this.realpaths) {
            	rtdata.realpaths.push(this.realpaths[key].toJSON());
        	}
        }

        return rtdata;
    }

    , that = {
        init: init,
        setId: setId,
        getId: getId,
        setClientId: setClientId,
        setStatus: setStatus,
        getKeys: getKeys,
        update: update,
        setValue: setValue,
        resetFile: resetFile,
        getValue: getValue,
        getDirty: getDirty,
        md5Dirty: md5Dirty,
        isPart: isPart,
        setPartOf: setPartOf,
        isDir: isDir,
        isNew: isNew,
        isDirty: isDirty,

        addPart: addPart,
        getPart: getPart,
		updatePart: updatePart,
        deletePart: deletePart,

        generatePath: generatePath,
		addRealPath: addRealPath,
		getRealPath: getRealPath,
		getReadyPath: getReadyPath,
        getReadyPathSimple: getReadyPathSimple,
		getUnreadyPath: getUnreadyPath,
        getUploadPath: getUploadPath,
        getDuplicationPath: getDuplicationPath,
        getEmptyPathCount: getEmptyPathCount,
        getEmptyFile: getEmptyFile,

        toJSON: toJSON 
    };

    return that.init(_metadata);
};