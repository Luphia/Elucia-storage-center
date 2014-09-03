define(function() {
	var Application = function() {
		var node,
			data,

		init = function(_node, _data) {
			node = _node;
			data = _data;

            $('div#icon', _node).hover(function() {
            	$(this).addClass('hover');
            }, function() {
            	$(this).removeClass('hover');
            });

            $('div#icon', _node).click(function() {
                var file = _node.parent().parent().children('div.content').children('.selected'),
                	fileName = file.children('div.name').text(),
                	filePath = file.children('div.path').text();
                
                file.children('div.visible_name').text('').append("<input style='height: 10px'>");
                file.children('div.visible_name').children('input').focus();

                file.children('div.visible_name').children('input').keypress(function(event) {
                	// 若使用 keydown 事件，只能分辨鍵盤哪個位置觸發，無法區分有無壓下shift鍵
                	// 例如 / 和 ? 在 keydwon 事件下 event.which 皆為 191
                	return limitInput(event.which);
                });

                file.children('div.visible_name').children('input').keyup(function(event) {
                    if (event.which == 13) {
                        var newName = $.trim(file.children('div.visible_name').children('input').val()),
                        	fileType = file.children('div.type').text();

                        if ( newName == "") {
                        	elucia.msg("檔案名稱請勿空白");
                        	file.children('div.visible_name').text(fileName);
                        }
                        else if (findSameName( newName, fileType )) {
                        	elucia.msg("更名失敗，檔案名稱衝突");
                        	file.children('div.visible_name').text(fileName);
                        }
                        else {
                        	var parentPath = getParentPath(filePath),
                        		data = {
                        			"newName": parentPath.concat(newName),
                        			"oldPath": filePath
                        		};

                        	updateData(data);
                        	file.children('div.visible_name').children('input').remove();
                        	file.children('div.visible_name').text(newName).trunk8();
                            file.children('div.visible_path').text(parentPath.concat(newName)).trunk8();	
                        }
                    }        
                });
			})

			return this;
		},

		getParentPath = function( _path ) {
			var lastIndex = _path.lastIndexOf('/');
			if (lastIndex == -1)
				return ""; 
			else
				return _path.slice(0,lastIndex+1);
		},

		findSameName = function( _name, _type ) {
			var divContent = $('div.browser div.content'),
				divFile = divContent.children('div#file');

			for (var i = 0; i < divFile.length; i++) {
				var fileName = divFile.children("div.name:eq("+i+")").text(),
					fileType = divFile.children("div.type:eq("+i+")").text();
				if (fileType == _type && fileName == _name) return true;
			}
			return false;
		},

		limitInput = function( _keyCode ) {
			var result = true;
			if (_keyCode == 34) result =  false; // limit input "
        	if (_keyCode == 42) result =  false; // limit input *
        	if (_keyCode == 47) result =  false; // limit input /
        	if (_keyCode == 58) result =  false; // limit input :
        	if (_keyCode == 60) result =  false; // limit input <
        	if (_keyCode == 62) result =  false; // limit input >
        	if (_keyCode == 63) result =  false; // limit input ?
         	if (_keyCode == 92) result =  false; // limit input \
         	if (_keyCode == 124) result =  false; // limit input |
         	if (!result) {
         		elucia.msg("檔案名稱不可以包含下列任意字元：\\ /:*?\"<>|");
         	}
         	return result;
		},

		updateData = function(_data) {
			console.log("### appliaction.updateData ###");
			elucia.rest.put({
				url: 'meta/' + _data.oldPath,
				data: {"newName": _data.newName},
				success: function( _response ) {
					console.log("rename success.");
				}
			});
		},

		destroy = function( _data ) {
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			updateData: updateData,
			destroy: destroy
		};

		return that;
	};

	return Application;
});