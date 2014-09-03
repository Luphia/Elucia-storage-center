define(function() {
	var Application = function() {
/*
	如果json檔案結構改變的話
  需要更改的檔案有browser.file js ->去json讀取檔案資訊
  以及browser.search js ->去每個json讀取檔案資訊
  還有browser.list js ->去每個json讀取資料夾
*/
		var node,
			  data,
        virtual_root = "iiibox",
        actual_root = "meta",

		init = function(_node, _data) {
            this.node = _node;
            this.data = _data;
			
            var tmpWidget = {
                "name": "browser.navigation",
                "data": "/"
            };
            elucia.addTo( tmpWidget, $("div.operate", _node) );
          
            insertWidget( "browser.search", "", "div.operate", _node );
            insertWidget( "browser.back", "", "div.operate", _node );
            insertWidget( "browser.create", "", "div.operate", _node );
            insertWidget( "browser.rename", "", "div.operate", _node );
            insertWidget( "browser.delete", "", "div.operate", _node );
            insertWidget( "browser.view", "grid", "div.operate", _node );
          
            insertWidget( "browser.sort", "", "div.table > div:nth-child(1)", _node );
            insertWidget( "browser.sort", "", "div.table > div:nth-child(2)", _node );
            insertWidget( "browser.sort", "", "div.table > div:nth-child(3)", _node );
          
            $('div.table div.table_td', _node).hover(function() {
                $(this).parent().children('div.sort').children('div#icon').show();
            }, function() {
                $(this).parent().children('div.sort').children('div#icon').hide();
            });

            $('div.table div.table_td', _node).click(function() {
                $(this).parent().children('div.sort').children('div#icon').click();
            });

            var tmpListWidget = {
                "name": "browser.list",
                "data": {
                    "name": virtual_root, 
                    "path": ""
                } 
            };
      
            elucia.addTo(tmpListWidget, $("div.list", _node), function() {
                // 將下行程式碼註解，以提高整體效能
                // getList( "./" + actual_root + '/', _node );
                $("div.list", _node).children("div.folder").css("display","inline");
            });
          
            getData( "./" + actual_root + '/', _node );

            dropAutoUpload(_node);

            return this;
		},

        addIndicator = function( _folder, _path, _node ) {
            $(_folder + " div.path", _node).filter(function() {
                return $(this).text() === _path;
            }).parent().children("div#indicator").addClass("indicator");
        },

        dropAutoUpload = function(_node) {
            $("div.content", _node).on(
              'dragover',
              function(e) {
                e.preventDefault();
                e.stopPropagation();
              }
            );

            $("div.content", _node).on(
              'dragenter',
              function(e) {
                e.preventDefault();
                e.stopPropagation();
              }
            );
            
            $("div.content", _node).on(
                'drop',

                function(event) {
                    event.preventDefault();

                    var items = event.originalEvent.dataTransfer.items; 
                    for (var i=0; i<items.length; i++) {
                        // webkitGetAsEntry is where the magic happens
                        // var item = items[i].webkitGetAsEntry();
                        if (items[i]) {
                            fileUpload( items[i], _node );
                        }
                    }
                }

                /*
                function(e){
                    if(e.originalEvent.dataTransfer){
                        if(e.originalEvent.dataTransfer.files.length) {
                            e.preventDefault();
                            e.stopPropagation();
                            var file = e.originalEvent.dataTransfer.files;
                            fileUpload( file, _node );
                        }   
                    }
                }
                */
            );
        },

        fileUpload = function( _data, _node ) {
            var tmpWidget = {
                "name": "browser.fileUpload",
                "data": {
                    "Entry": _data.webkitGetAsEntry(),
                    "File": _data.getAsFile()
                }
            };

            if (_data.webkitGetAsEntry())
                elucia.addTo( tmpWidget, $("div.content", _node) );
        },

    	getData = function( _url, _node ) {
            elucia.rest.get({
    			url: _url,
    			success: function(_data) {
                    var tmpData = _data.data.files,
                    todo = tmpData.length;

                    for(var key in tmpData) {
                        var tmpWidget = {
                            "name": "browser.file",
                            "data": tmpData[key]
                        };
                        elucia.addTo( tmpWidget, $("div.content", _node), function() {
                            todo--;
                            if (todo==0) {
                                $('div.table div.tr_name div.sort div#icon', _node).click();
                            }     
                        });
                    }
    			}
    		});      
    	},
    
        getList = function( _path, _node ) {
            /* 讀取參數_path的內容 */
            /* 若為資料夾型態 */
            /* 則呼叫elucia.addTo()方法，將資料夾加入div.list區塊 */
            elucia.rest.get({
                url: _path,
                success: function(_data) {
                    var tmpData = _data.data.files;

                    for(var key in tmpData) {
                        var fileType = tmpData[key].type;
                        var listWidget = {
                            "name": "browser.list",
                            "data": tmpData[key]
                        };
                        if( fileType == "folder" ) {                
                            var folderUrl = getPathOfParent( tmpData[key].path, level ); // 找出上層資料夾的path內容
                            var level = getLevel( _path, actual_root ); // 算出距離根目錄階層
                            var folder = "div.folder";
                            
                            for(var i = 1; i < level; i++) {
                              folder += " div.folder";
                            }
                            
                            addIndicator( folder, folderUrl, _node );
                            elucia.addTo( listWidget, $(folder + " div.path", _node).filter(function() {
                                    return $(this).text() === folderUrl; 
                                }).parent(), function(_callbackNode,_callbackData,_obj) {
                                    getList( _path + _obj.data.name + "/", _node );
                                }
                            );
                        } 
                    } // end of for
                } // end of success
            });
        },

        getPathOfParent = function( _path, _level ) {
            // 此函數為找出上層資料夾的path內容
            // 例如./meta/folder/images/
            // 該images資料夾的上層資料夾為folder
            // 因此函數會回傳folder的path為 "folder/"
            if( _level == 1 )
                return "";
            else {
                var lastIndex = _path.lastIndexOf('/');
                var actual_path = _path.slice(0,lastIndex);
                lastIndex = actual_path.lastIndexOf('/');

                return actual_path.slice(0,lastIndex+1);
            }    
        },
 
        getLevel = function( _path, _root ) {
            var lastIndex = _path.lastIndexOf( _root ),
                len = _root.length,
                str;
          
            if( lastIndex == -1)
                return;
            else {          
                str = _path.slice(lastIndex+len);
                return str.split('/').length-1;  
            }
            
        },

        getParentNameByPath = function( _path ) {
            if( typeof(_path) === "undefined" || _path === null )
                return;
            else {
                var len = _path.length,
                    str,
                    lastIndex;
            
                if( _path.charAt(len-1) === '/' ) {
                    lastIndex = _path.lastIndexOf('/');
                    str = _path.slice(0,lastIndex);
                }
                else
                    str = _path;
            
                lastIndex = str.lastIndexOf('/');
                if( lastIndex == -1 )
                    return;
                else {
                    if( str.slice(lastIndex+1)===actual_root )
                        return virtual_root; // 如果父目錄為根目錄，回傳虛擬根目錄名稱
                    else
                        return str.slice(lastIndex+1);
                }  
            }
        },

        insertWidget = function( _name, _data, _target, _node ) {
            var widget = {
                'name': _name,
                'data': _data
            };
            elucia.addTo( widget, $(_target, _node) );
        },

        traverseFileTree = function(item, path) {
            path = path || "";
                if (item.isFile) {
                // Get file
                item.file(function(file) {
                    console.log("File:", path + file.name);
                });
            } else if (item.isDirectory) {
                // Get folder contents
                var dirReader = item.createReader();
                dirReader.readEntries(function(entries) {
                    for (var i=0; i<entries.length; i++) {
                        traverseFileTree(entries[i], path + item.name + "/");
                    }
                });
            }
        },

        updateData = function(_data) {
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