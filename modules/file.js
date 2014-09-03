var uploadPath = ""
,   pattern1 = "_0000_"
,   pattern2 = "____zzzz____"
,   fs = require("fs")
;

module.exports = {
    init: function(_path) 
    {
		console.log("in file:init");
        _path && (uploadPath = _path);
        return this;
    }
    ,   pathEncode: function(_url)
    {
        // return uploadPath + _url.replace(new RegExp(pattern1, "gm"), pattern2).replace(new RegExp("/", "gm"), pattern1);
        return uploadPath + new Buffer(_url).toString('hex');
    }
    ,   pathDecode: function(_url)
    {
        // return _url.replace(new RegExp(pattern1, "gm"), "/").replace(new RegExp(pattern2, "gm"), pattern1);
        return new Buffer(_url, 'hex').toString('utf8');
    }
    ,   readFileStream: function(_path) 
    {
        return fs.createReadStream(module.exports.pathEncode(_path));
    }
    ,   writeFileStream: function(_path)
    {
        return fs.createWriteStream(module.exports.pathEncode(_path));
    }
    ,   md5: function(_file, _callBack) {
        try {
            var filename = _file.path
            ,   crypto = require('crypto')
            ,   fs = require('fs')
            ,   md5sum = crypto.createHash('md5')
            ,   rs = fs.ReadStream(filename)

            rs.on('data', function(d) {
                md5sum.update(d);
            });

            rs.on('end', function() {
                var rtdata = md5sum.digest('hex');
                _callBack(false, rtdata);
            });
        }
        catch(e) {
            _callBack(e);
        }
    }
    ,   upload: function(_file, _path)
    {
		console.log("### 3");
        var ws = module.exports.writeFileStream(_path),
            rs = fs.createReadStream(_file.path);
		console.log("### 4");
        rs.pipe(ws);
        fs.unlink(_file.path);
    }
    ,   output: function(_stream, _path)
    {
        try {
        var ws = _stream,
            rs = module.exports.readFileStream(_path);

        rs.pipe(ws);
        }
        catch(e) {
            console.log("1");
        }
    }
};