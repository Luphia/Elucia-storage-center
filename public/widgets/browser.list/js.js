define(function() {
    var Application = function() {
		var node,
        root = "meta",

		init = function(_node, _data) {
		    node = _node;         
        if (elucia.stringBytes(_data.name) >= 18) {
            $('div.name', _node).prop('title',_data.name);
            for(var i =7; i<=15; i++) {
                if (elucia.stringBytes(_data.name.slice(0,i))>=14) {
                    $('div.name', _node).text(_data.name.slice(0,i-1).concat('...'));
                    i = 15;
                }
            }
        }
        else 
            $("div.name", _node).text(_data.name);
        $("div.path", _node).text(_data.path);
      
        $("div.name", _node).click(function() {
            var virtual_path = $(this).parent().children("div.path").text(),
                actual_path = "./".concat( root + '/' + virtual_path );

            getData( actual_path, this );
    	});

        $("div.name", _node).hover(function() {
            $(this).addClass('hover');
        }, function() {
            $(this).removeClass('hover');
        });

        allowDropFile( "div.name", _node );

        $("div#indicator", _node).click(function() {
            var deg = parseInt( $(this).parent().children('div.rotate_deg').text() ),
                enable = $(this).hasClass('indicator');
            if (enable) {
                if(deg==0) {
                    deg = 90;
                    rotate( this, deg );
                    openFolder( this );
                }
                else {
                    deg = 0;
                    rotate( this, deg );
                    closeFolder( this );
                }
            }
        });

    		return this;
		},

    allowDropFile = function( _target, _node ) {
        $(_target, _node).on(
            'dragover',
            function(e) {
                if (e.preventDefault) e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                return false;
            }
        );

        $(_target, _node).on(
            'drop',
            function(e) {
                e.preventDefault();
                e.stopPropagation();
                var data = e.originalEvent.dataTransfer.getData('Text'),
                    fileName = getFileName( data ),
                    folderUrl = $(this).parent().children('div.path').text();

                if (folderUrl.concat(fileName) === data)
                    console.log("Same Folder.");
                else {
                    console.log("drop file path is " + data);               
                    elucia.rest.put({
                        'url': 'meta/' + data,
                        'data': {'newName': folderUrl.concat(fileName)},
                        success: function() {
                            console.log("drop " + fileName + " successful.");
                            deleteFile( data );
                        } 
                    });
                }
            } // end of drop function(e)
        );
    },

	deleteFile = function( _data ) {
        if (typeof _data == 'undefined' || _data == null)
            return;
        else {
            var divContent = $('div.browser div.content'),
                divFile = divContent.children('div#file');

            divFile.children('div.path').filter(function() {
                return $(this).text() === _data;
            }).parent().fadeOut(400, function() {
                $(this).remove();
                if (divContent.children('div#file').length == 0) {
                    var text = $("<div class='text'>There is empty.</div>");
                    divContent.append(text).hide().fadeIn(1200);
                }
            });
        }
        console.log("### file.destroy ###");
    },

    getData = function( fileUrl, _element ) {     
        var fileWidget = {
          "name": "browser.file",
          "data": []
        };
      
        elucia.addTo(fileWidget, "", function( _callbackNode, _callbackData, _obj ){
            _obj.addData( fileUrl );
            selected( _element );
        });
        return true;
    },

    getFileName = function( _path ) {
        if (typeof _path == 'undefined')
            return;
        else {
            var lastIndex = _path.lastIndexOf('/');
            if (lastIndex == -1)
                return _path;
            else
                return _path.slice(lastIndex + 1);
        }
    },

    getList = function( _path ) {
        var request = {
            url: "./" + root + '/' + _path,
            success: function(response) {
                var fileList = response.data.files,
                    hasChildFolder = false,
                    drawListCount = 0;
                for(var key in fileList) {
                    var fileType = fileList[key].type;
                    if (fileType == 'folder') {
                        hasChildFolder = true;
                        var listWidget = {
                            name: "browser.list",
                            data: fileList[key]
                        };
                        elucia.addTo( listWidget, $("div.path", node).filter(function() {
                            return $(this).text() == _path;
                        }).parent(), function(_responseNode) {
                            _responseNode.css('display', 'inline');
                            drawListCount++;
                            if (drawListCount==fileList.length)
                                _responseNode.parent().children('div#indicator').removeClass('wait');
                        } );
                    }
                    else
                        drawListCount++;
                } // end of for
                if (!hasChildFolder) {
                    /* 如果無子資料夾，移除"開啟子資料夾"圖示 */
                    var indicator = $('div.path', node).filter(function () {
                        return $(this).text() == _path;
                    }).parent().children('div#indicator')
                        .removeClass('indicator')
                        .removeClass('wait');
                    rotate( indicator, 0 );
                }
            } // end of success
        };
        elucia.rest.get(request);
    },

    openFolder = function( folderIcon ) {
        var path = $(folderIcon).parent().children('div.path').text(),
            open = $(folderIcon).parent().children('div.get_metadata').text();
        $(folderIcon).addClass('wait');
        if (open == "false") {
            getList( path );
            $(folderIcon).parent().children('div.get_metadata').text("true");
        }
        else {
            $(folderIcon).parent().children('div.folder').css('display', "inline");
            $(folderIcon).removeClass('wait');
        }         
    },
    
    closeFolder = function( folderIcon ) {
        $(folderIcon).parent().children('div.folder').css('display', "none");
    },
    
    rotate = function( _object, _deg ) {
        $(_object).css("transform","rotate(" + _deg + "deg)");
        $(_object).parent().children('div.rotate_deg').text(_deg.toString());
    },

    selected = function( _object ) {
        $('div.list div.folder div.name').removeClass('selected');
        $(_object).addClass('selected');
    },

		updateData = function() {
      elucia.debug("### appliaction.updateData ###");
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			destroy: destroy
		};

		return that;
	};

	return Application;
});