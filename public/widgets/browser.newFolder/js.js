define(function() {
	var Application = function() {
/*
  若[widget] browser.file 底下的folder Icon(圖檔)有變更
  要同步更新此widget底下的images資料夾內的folder圖檔
*/
		var node,
            data,
            root = "./meta/",

		init = function( _node, _data ) {
			node = _node;
			data = _data;

            if( typeof(_data) == "undefined" || _data == null )
                return;
            else
                initialData( _node, _data ); // 初始化參數，將檔案的詳細資料寫入各個div tag
      
            _node.click(function() {
                elucia.debug($(this));
            });
      
            _node.hover(
                function() {
                    $(this).addClass('hover');
                }, function() {
                    $(this).removeClass('hover');
                }
            );
      
            $("div#icon", _node).click(function() {
                setMetadata( _data.path );
            });

			return this;
		},
    
    initialData = function( _node, _data ) {
        var dt = new Date(_data.date);

        $("div#file", _node.parent()).removeClass(); //將其他已選取的檔案取消
        $("div#icon", _node).addClass("folderIcon");
        
        $("div.name", _node).focus();
        $("div.date", _node).text(dt.toLocaleString());
        $("div.type", _node).text(_data.type);
        $("div.size", _node).text(_data.size);
        $("div.path", _node).text(_data.path);
        $("div.visible_path", _node).text(_data.path).trunk8();
        _node.keyup(function(event) {
            if(event.which == 13) {
                setMetadata( _data.path );
            }
        });     
    },

    callFileWidget = function( _path, _name ) {
        destroy(); // 刪除newFolder widget本身
        elucia.debug("### 建立" + _name + "資料夾成功 ###");
        var fileWidget = {
            "name": "browser.file",
            "data": {
                "name": _name,
                "date": $.now()/1000,
                "type": "folder",
                "size": 0,
                "path": _path + _name + '/'
            }
        };
        elucia.addTo(fileWidget, node.parent(), function( _callbackNode, _callbackData, _obj ) {
            _obj.setViewModel();
            _callbackNode.hide().fadeIn(2000);
        });
    },

    callListWidget = function( _path, _name ) {
        var listWidget = {
            "name": "browser.list",
            "data": {
                "name": _name,
                "path": _path + _name + '/'
            }
        }

        var parent = getParentPath();
        if (typeof parent == 'undefined')
            return;
        else {
            // 檢查父層資料夾原先是否有資料夾
            // 若沒有，則在父層新增"可開啟子資料夾"圖示
            if (!parent.children('div#indicator').hasClass('indicator'))
                parent.children('div#indicator').addClass('indicator');
            elucia.addTo( listWidget, parent, function() {
                callFileWidget( _path, _name );
            });
        }
    },

    findSameFolder = function( _name ) {
        var divFile = "div.browser div.content div#file";
            for(var i = 0;i < $(divFile).length;i++) {
                var fileType = $(divFile + " div.type:eq("+i+")").text();
                var fileName = $(divFile + " div.name:eq("+i+")").text();
                if( fileType == "folder" && fileName == _name ) {
                    return true;
                }
            }
        return false;
    },

    getParentPath = function() {
        // 此函式功能為在資料夾樹狀結構清單中找出上層資料夾路徑
        // 藉由這個路徑得知樹狀清單中的上層資料夾
        var divBrowser = node.parent().parent(),
            divNav = divBrowser.children('div.operate').children('div.nav'),
            curr_path = divNav.children('div#path').text();

        curr_path = curr_path.slice(1);
        if (typeof curr_path == 'undefined' || curr_path == null)
            return divBrowser.children('div.list').children('div.folder');
        else {
            var divFolder = divBrowser.children('div.list').find('div.path').filter(function() {
                    return $(this).text() === curr_path; 
                }).parent();

            return divFolder;
        }
    },

    setMetadata = function( _path ) {
        var name = $.trim( $("div.name", node).text() );
        if( typeof name == 'undefined' || name == null || name == "" ) {
            elucia.confirm("建立資料夾失敗，資料夾名稱不正確!", {
                "ok": function() {
                    destroy();
                },
                "cancel": function() {
                    destroy();
                }
            });
            
        }    
        else {
            if( findSameFolder(name) ) {
                elucia.confirm("建立資料夾失敗，資料夾名稱衝突!", {
                    "ok": function() {
                        destroy();
                    },
                    "cancel": function() {
                        destroy();
                    }
                });
            }
            else {
                elucia.rest.post({
                    "url": root + _path + name + '/',
                    success: callListWidget( _path, name )
                });
            }
        }
    },

    setViewModel = function() {
        var divOperate = node.parent().parent().children("div.operate");
        divOperate.children('div.view').children('div#icon').click().click();
    },

	destroy = function() {
		elucia.debug("### newFolder.destroy(自殺) ###");
        node.fadeOut(400, function() {
            $(this).remove();
        });
	},

	that = {
		init: init,
        setViewModel: setViewModel,
		destroy: destroy
	};

		return that;
	};

	return Application;
});