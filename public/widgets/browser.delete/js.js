define(function() {
	var Application = function() {
		var node,
			data,
			root,

		init = function(_node, _data) {
			node = _node;
			data = _data;
			root = 'meta';

            $('div#icon', _node).hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });

			// 需注意資料夾須清空才可刪除
			$('div#icon', _node).click(function() {
				var file = _node.parent().parent().children('div.content').children('.selected');

				if (file.length == 0)
					elucia.msg("刪除檔案前，請先選擇一個檔案！");
				else
					confirmDelete( file );
			})

			return this;
		},

		confirmDelete = function( _data ) {
			var fileName = _data.children('div.name').text(),
            	fileType = _data.children('div.type').text();

        	if( fileType == 'folder' )
        	    fileType = '資料夾';
        	else
        	    fileType = '檔案';
        	elucia.confirm("是否刪除 " + fileName + ' ' + fileType + "？", {
        	    "ok": function() {
        	        deleteFile( _data );
        	    }, "cancel": function() {
        	        console.log("Cancel delete folder.");
        	    } 
        	});
		},

		countFolder = function() {
    	    var count = node.parent().parent()
    	    				.children('div.content')
    	    				.children('div#file')
    	    				.children('.folderIcon').length;
    	    return count;
    	},

		deleteFile = function( _data ) {
			var path = _data.children('div.path').text();
			
			elucia.rest.del({
        	    'url': './' + root + '/' + path,
        	    'Authorization': 'Bearer ' + configuration.user.token,
        	    success: function( _response ) {
        	        if( _response.result == 1 ) {
                    	var divContent = _data.parent();
                    	if (_data.children('div.type').text() == 'folder') {
                    	    deleteFolder( path );
                    	}

                    	if (divContent.children('div#file').length == 1) {
                    		var text = $("<div class='text'>There is empty.</div>");
                    		divContent.append(text).hide().fadeIn(1200);
                		}
                    	destroy( _data );
        	        }
        	        else
        	        	elucia.debug("File Delete Fail.");
        	    }
        	});
        	// 還原功能
        	/*
        	elucia.rest.get({
				'url': './recovery/' + path,
				'Authorization': 'Bearer ' + configuration.user.token
			});
			*/
		},

		deleteFolder = function( _path ) {
    	    if (typeof _path == 'undefined')
    	        return;
    	    else {
    	        var divPath = $('div.browser div.list div.folder div.path'),
    	            curr_path = $('div.browser div.operate div.nav div#path').text().slice(1);

    	        divPath.filter(function() {
    	            return $(this).text() === _path;
    	        }).parent().remove();

    	        if (countFolder() == 1) {
    	            divPath.filter(function() {
    	                return $(this).text() === curr_path;
    	            }).parent().children('div#indicator')
                        .css('transform', 'rotate(0deg)')
                        .removeClass('indicator')
                        .parent().children('div.rotate_deg').text("0");
    	        }
    	    }
    	},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		destroy = function( _data ) {
			elucia.debug("### File Delete Success ###");
			_data.remove(); // 先暫時用 remove，若日後增加還原功能，可改用 display
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