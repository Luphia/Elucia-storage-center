/* metadata
{
    "uuid":"xxxx-xxxx-001",
    "part":1,
    "md5":"1b7598e690aa16a956af2a27999d84bc"
}
 */

module.exports = function(_realpath) {
    // keys 為開放更改的參數
    var keys = ["file_id", "file_path", "supplier_id", "machine_id", "status"]

    , init = function(_realpath) {
        this.keys = keys;
        this._meta = {};
        this.id = _realpath.file_path_id;
        this._meta.file_path_id = _realpath.file_path_id;
        this._meta.file_id = _realpath.file_id;
        this._meta.file_path = _realpath.file_path;
        this._meta.supplier_id = _realpath.supplier_id;
        this._meta.machine_id = _realpath.machine_id;
        this._meta.status = _realpath.status
        this.dirtyKeys = [];

        return this;
    }
    , setId = function(_id) {
        this.id = _id;
        return this;
    }
    , pathReset = function(_path) {
        var tmp = this._meta.file_path.substr(0, this._meta.file_path.lastIndexOf("/") + 1);
        this._meta.file_path = tmp + _path;
    }
    , getId = function() {
        return this.id;
    }
    , setFileId = function(_id) {
        this._meta.file_id = _id;
        return this;
    }
    , setStatus = function(_status) {
        switch(_status) {
            case 3:
            case "3":
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
    , setValue = function(_key, _value) {
        if(this.keys.indexOf(_key) > -1) {
            this._meta[_key] = _value;
            this.dirtyKeys.push(_key);
        }

        return this;
    }
    , getValue = function(_key) {
        if(this.keys.indexOf(_key) > -1 && typeof(this._meta[_key]) != "undefined" ) {
            return this._meta[_key];
        }
        else {
            return null;
        }
    }
    , isNew = function() {
        return !(typeof(this.id) == "number");
    }
    , isDirty = function() {
        return !(typeof(this.id) == "number") || this.dirtyKeys.length > 0;
    }
    , isReady = function() {
        return this._meta.status == 1;
    }
    , toJSON = function() {
        var rtdata = {
            file_path_id: this._meta.file_path_id,
            file_id: this._meta.file_id,
            file_path: this._meta.file_path,
            supplier_id: this._meta.supplier_id,
            machine_id: this._meta.machine_id,
            status: this._meta.status
        };

        return rtdata;
    }

    , that = {
        init: init,
        setId: setId,
        getId: getId,
        pathReset: pathReset,
        setFileId: setFileId,
        setStatus: setStatus,
        setValue: setValue,
        getValue: getValue,
        isNew: isNew,
        isReady: isReady,
        isDirty: isDirty,
        toJSON: toJSON 
    };

    return that.init(_realpath);
};