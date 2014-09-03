module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},

	execute = function(_data, _callback)
	{console.log("++++++++++++++++++++++++++ file upload confirm +++++++++++++++++++++++++++");
		var config = require("../../config/config"),
		    MF = require("../../modules/metadataFactory").init(config),
			fileName = _data.fileName,	
			clientId = _data.clientId,
			ip = _data.ip,
			fileType = _data.fileType,
			supplierBytes = _data.bytes,
			supplierMd5 = _data.md5,
		    myMeta,
		    realPath;

	    MF.load({"realpath": fileName, "isRealpath": true}, clientId, function(_err, _meta) 
    	{  
    		if(_err || !_meta) 
			{
				_data._result.message = "MF upload error";
				_data._result.result = 0;
				console.log(_err);

				_callback(false,job);
			} 
			else 
			{ 
				//db data
				myMeta = _meta; 

				//search fle path
				var tmpReal;
				realPathList = myMeta.getUnreadyPath();
				pathCount = realPathList.length; 
				pathCheck = false;

				for(var i=0;i<pathCount;i++)
				{
					tmpReal = realPathList[i];
					tmpPath = tmpReal.getValue("file_path");

					if(tmpPath.indexOf(fileName) != -1 && tmpPath.indexOf(ip) != -1)
					{
						pathCheck = true;
						realPath = tmpReal;
						break;
					}
				}

				//db md5
				dbMd5 = myMeta.getValue("md5");
				dbBytes = myMeta.getValue("bytes");

				//check supplier data & db data
				var noMD5 = (typeof dbMd5 == 'undefined' || dbMd5 == null || dbMd5 == "" || dbMd5 == "null"),
					sizeZero = (typeof dbBytes == 'undefined' || dbBytes == null || dbBytes == "" || dbBytes == "null");
					checkMD5 = noMD5 || (supplierMd5 == dbMd5),
					checkSize = sizeZero || (dbBytes == supplierBytes),
					errorMSG = [];

				if(!checkMD5) {
					errorMSG.push("MD5 error: " + supplierMd5 + "(should be " + dbMd5 + ")");
				}
				if(!checkSize) {
					errorMSG.push("file Size error: " + supplierBytes + "(should be " + dbBytes + ")");
				}
				if(!pathCheck) {
					errorMSG.push("file upload denied");
				}

				if(errorMSG.length > 0) {
					_data._result.message = errorMSG.join(" / ");
					_data._result.result = 0;
					_callback(false,job);
				}
				else {
					if(noMD5)
						myMeta.setValue("md5", supplierMd5);
					if(sizeZero)
						myMeta.setValue("bytes", supplierBytes);

					myMeta && myMeta.setStatus(1);
					myMeta.setValue("file_type",fileType);
					realPath && realPath.setStatus(1);
					MF.save(myMeta, function() {
						_callback(false,job);
					});

					_data._result.message = "confirm ok";
					_data._result.result = 1;
					_data._result.data = {
						"path": realPath.getValue("file_path"),
						"detail": {
							"file_id": myMeta.getId(),
							"url": myMeta.getValue("file_name"),
							"md5": supplierMd5
						}
					}
				}				
			}		
    	});
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}