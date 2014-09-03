  define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
            data,
            root = "meta",

		init = function( _node, _data ) {
			node = _node;
			data = _data;

            if( typeof(_data) == "undefined" || _data == null )
                return;
            else {
                initialData( _node, _data ); // 初始化參數，將檔案的詳細資料寫入各個div tag
            }

            _node.click(function() {
                $("div#file").removeClass("selected");
                $(this).addClass("selected");
            });
      
            _node.hover(
                function() {
                    $(this).addClass('hover');
                }, function() {
                    $(this).removeClass('hover');
                }
            );
      
            _node.keyup(function(event) {
                if( event.which == 46 ) {
                    _node.parent().parent()
                        .children('div.operate')
                        .children('div.delete')
                        .children('div.icon').click();
                }
            });

            $("div.visible_name", _node).hover(
                function() {
                    $(this).addClass("underline");
                }, function() {
                    $(this).removeClass("underline");
                }
            );

            $("div.visible_name", _node).dblclick(function() {
                getData( _node );
            });
      
            $("div#icon", _node).dblclick(function() {
                getData( _node );
	        });

			return this;
		},
    
    initialData = function( _node, _data ) {
        var dt = new Date(_data.date*1000);

        if( _data.type == "folder" )
            $("div#icon", _node).addClass("folderIcon");
        else
            $("div#icon", _node).addClass("fileIcon");

        $("div.name", _node).text(_data.name);
        $("div.visible_name", _node).text(_data.name).trunk8();
        $("div.date", _node).text(dt.toLocaleString());
        $("div.msecond", _node).text(_data.date);
        $("div.type", _node).text(_data.type);
        $("div.size", _node).text(_data.size);
        $("div.path", _node).text(_data.path);
        $("div.visible_path", _node).text(_data.path).trunk8();
        if (_data.type != "folder") {
            if (_data.ready == 0) {
                _node.css('opacity',0.5);
            } else if (_data.encrypt == true) {
                var cvs = $("#myCanvas", _node)[0],
                    ctx = cvs.getContext("2d");

                var drawing = new Image();
                drawing.src = "/images/lock.png";
                drawing.onload = function() {
                   ctx.drawImage(drawing,cvs.width/2,cvs.height/3*2,cvs.width/4,cvs.height/4);
                }
            } 
            /*
            else if (_data.physical == 0) {
                var cvs = $("#myCanvas", _node)[0],
                    ctx = cvs.getContext("2d"),
                    width = cvs.width,
                    height = cvs.height,
                    x1 = width/6,
                    x2 = width/6*5;

                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(width/3,0);
                ctx.lineTo(width/3,height);
                ctx.moveTo(width/2,0);
                ctx.lineTo(width/2,height);
                ctx.moveTo(width/3*2,0);
                ctx.lineTo(width/3*2,height);
                ctx.moveTo(x1,height/4);
                ctx.lineTo(x2,height/4);
                ctx.moveTo(x1,height/2);
                ctx.lineTo(x2,height/2);
                ctx.moveTo(x1,height/4*3);
                ctx.lineTo(x2,height/4*3);
                ctx.stroke();
            }
            */
            _node.prop('draggable', 'true'); // allow div#file be dragged
            var img = new Image();
            img.src = './images/file.png';
            _node.on(
                'dragstart',
                function(e) {
                    e.originalEvent.dataTransfer.effectAllowed = 'copy'; 
                    e.originalEvent.dataTransfer.setData('Text', $(this).children('div.path').text());
                    e.originalEvent.dataTransfer.setDragImage( img, -10, -10 );
                }
            );
        } // end of if type is file
        else {
            _node.on(
                'dragover',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    // only dropEffect='copy' will be dropable
                    // required otherwise doesn't work
                    e.originalEvent.dataTransfer.dropEffect = 'copy';
                    return false;
                }
            );

            _node.on(
                'drop',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var data = e.originalEvent.dataTransfer.getData('Text'),
                        fileName = getFileName( data ),
                        folderUrl = $(this).children('div.path').text();

                    console.log("drop file path is " + data);
                    elucia.rest.put({
                        'url': 'meta/' + data,
                        'data': {'newName': folderUrl.concat(fileName)},
                        success: function() {
                            console.log("drop " + fileName + " successful.");
                            destroy( data );
                        } 
                    });
                }
            );
        }
        $("div.physical", _node).text(_data.physical);
        $("div.encrypt", _node).text(_data.encrypt);
        $("div.ready", _node).text(_data.ready);   
    },

    getData = function( _node ) {
        var name = $("div.name", _node).text(),
            type = $("div.type", _node).text(),
            path = $("div.path", _node).text(),
            physical = $("div.physical", _node).text(),
            encrypt = $("div.encrypt", _node).text(),
            ready = $("div.ready", _node).text(); 
      
        if( type == "folder" ) {
            addData( "./" + root + '/' + path );
        }  
        else {
            if (ready == 0)
                elucia.msg("此檔案尚未上傳完成");
            else if (encrypt === 'true')
                elucia.msg("無法下載加密的檔案");
            else if (physical == 0)
                elucia.msg("此檔案目前無法下載");
            else {
                $('#myCanvas', _node).remove();
                fileDownload( path );
            }    
        }
    },

    addData = function( folder ) {      
        $("div.browser div.content").empty();
        $("div.browser div.operate div#path").text( folder.slice(2+root.length) );
        $("div.browser div.list div.folder div.name").removeClass('selected');
      
        elucia.rest.get({
			url: folder,
			success: function(_data) {
            var tmpData = _data.data.files,
				fileCounter = 0; // 計算有多少筆檔案已加入 content
          
                for(var key in tmpData) {
                    var tmpWidget = {
			 	 	    "name": "browser.file",
			 	 	    "data": tmpData[key]
			 	    };

			 	    elucia.addTo(tmpWidget, $("div.browser div.content"), function() {
                        fileCounter++;
                        // 若所有檔案皆已加入 content ，則調整檢視模式
                        if( fileCounter == tmpData.length ) {
                            $('div.browser')
                                .children('div.table')
                                .children('div.tr_name')
                                .children('div.sort')
                                .children('div#icon').click();

                            setViewModel();
                        }                                
                    });
			    } // enod of for loop

                if (tmpData.length == 0) {
                    var text = $("<div class='text'>There is empty.</div>");
                    $('div.browser div.content').append(text).hide().fadeIn(1200);
                }
		    } // end of success function
		}); // end of elucia.rest.get

        return true;
    },

    fileDownload = function( _path ) {
        getActualpath( _path );
    },

    getActualpath = function( _path ) {
        if (typeof _path == 'undefined')
            return;
        else {
            elucia.rest.get({
                'url': './' + root + '/' + _path,
                success: function( _res ) {
                    if ( _res.data.realpath ) {
                        var widget = {
                            "name": "ProgressEvent",
                            "data": {
                                "width": node.children('div#icon').width(),
                                "height": node.children('div#icon').height(),
                                "fontSize": node.children('div#icon').height()/6,
                                "url": _res.data.realpath
                            }
                        };
                        elucia.addTo( widget, $('div#icon', node) );

                        getFile( getFileName(_path), _res.data.realpath );
                    }
                    else {
                        console.log('404 Not Found file path');
                    }
                }
            });
        }
    },

    getFile = function( _name, _path ) {
        // xhr cross domain
        var xhr = new XMLHttpRequest();

        if ("withCredentials" in xhr) {
console.log('XHR2');
            xhr.open('GET', _path, true);
        }    
        // IE 8 & IE 9 不支援XHR2
        // IE 8 & IE 9 處理CORS問題只能使用XDomainRequest
        // 但是XDR限制多，Only GET or POST Method
        // The target URL must be accessed using the HTTP or HTTPS protocols.
        // No custom headers may be added to the request
        /*
        else if (typeof XDomainRequest != "undefined") {
            console.log('XDR');
            xhr = new XDomainRequest();
            xhr.open('GET', _path );
        }
        */
        
        xhr.setRequestHeader('Authorization', 'Bearer ' + configuration.user.token);
        xhr.responseType = "blob";
        xhr.onreadystatechange = function () { 
            if (xhr.readyState == 4) {
                var a = document.createElement('a'),
                    fileName = _name;

                a.href = window.URL.createObjectURL(xhr.response);
                if (typeof fileName == 'undefined')
                    a.download = _path;
                else
                    a.download = fileName;
                a.click();
            }
        };

        xhr.send();
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

    setViewModel = function() {
        elucia.debug("### setViewModel function ###");
        $('div.browser div.content div.text').remove();
        $('div.browser div.operate div.view div#icon').click().click();
        /*
        var tmpWidget = {
            "name": "browser.view",
            "data": $("div.browser div.operate div.view div.model").text()
        };

        elucia.addTo(tmpWidget, "", function( _callbackNode, _callbackData, _obj ) {;
            _obj.updateData( _obj.getData() );
        });
        */
    },

	destroy = function( _data ) {
        if (typeof _data == 'undefined' || _data == null)
            return;
        else {
            var divContent = $('div.browser div.content'),
                divFile = divContent.children('div#file');

            divFile.children('div.path').filter(function() {
                return $(this).text() === _data;
            }).parent().fadeOut(400, function() {
                $(this).remove();
            });
        }
        console.log("### file.destroy ###");
	},

	that = {
	    init: init,
        getData: getData,
        addData: addData,
        setViewModel: setViewModel,
	    destroy: destroy
	};

		return that;
	};

	return Application;
});