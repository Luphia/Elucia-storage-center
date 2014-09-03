// JavaScript Document
define(function() {
    var Application = function() {
        var node,
            todo,
            
        init = function(_node,_data) {
            node = _node;
            todo = 0;
            
            var virtual_path = $("div.browser div.operate div.nav div#path").text();
                
            virtual_path = virtual_path.slice(1);
            var reader = new FileReader(),
                formData = new FormData(),
                item = _data.Entry;

            // 檢查上傳的檔案是否為資料夾
            // 若為資料夾，則走訪資料夾結構
            if(item.isDirectory) {
                var type = "folder";
                todo++;
console.log("L24:todo is " + todo);
                if( findSameName( item.name, type ) ) {
                    var tmpNmae = item.name;

                    elucia.confirm("上傳資料夾"+tmpNmae+"失敗，資料夾名稱衝突!", {
                        "ok": function() {
                            todo--;
                            if (todo == 0) destroy();
                        },
                        "cancel": function() {
                            todo--;
                            if (todo == 0) destroy();
                        }
                    });
                }
                else {
                    var fileUrl = virtual_path + item.name + '/',
                        dirReader = item.createReader();

                    dirReader.readEntries(function(entries) {
                        todo += entries.length;
console.log("L45:todo is " + todo);
                        var entryFileTree = function() {
                            for (var i=0; i<entries.length; i++) {                        
                                traverseFileTree(entries[i], fileUrl);
                            }
                        };

                        postMetadata( _data.File, fileUrl, true, entryFileTree);
                    });
                } // end of no same folder                      
            } else if (item.isFile) {
                item.file(function(_file) {
                    var type = _file.type,
                    fileUrl = virtual_path + _file.name;
                    todo++;
console.log("L60:todo is " + todo);
                    if( findSameName( _file.name, type ) ) {
                        var tmpData = _file;
                        elucia.confirm("檔案名稱"+tmpData.name+"相同，是否覆蓋檔案？", {
                            "ok": function() {
                                formData.append('myfile', tmpData);
                                putXHR( formData, fileUrl );
                            },
                            "cancel": function() {
                                todo--;
                                if (todo == 0) destroy();
                            }
                        }); // end of confirm
                    }
                    else {
                        postXHR( _file, fileUrl, true );
                    }
                });
            } // end of if isFile
            
            return this;
        },

        addFileToContent = function( _data, _type, _url, _callback ) {
            var dt = new Date(_data.lastModifiedDate),
                tmpWidget = {
                    "name": "browser.file",
                    "data": {
                        "name": _data.name,
                        "date": dt.getTime()/1000,
                        "type": _type,
                        "size": _data.size,
                        "path": _url
                    }
                };

            elucia.addTo( tmpWidget, node.parent(), function(_callbackNode, _callbackData, _obj) {
                _obj.setViewModel();
                todo--;
console.log("L99:todo is " + todo);
                if (todo == 0) 
                    destroy();
                else
                    _callback && _callback();
            });          
        },

        addListToContent = function( _data, _url, _add, _callback ) {
            var parent = getParentFolderPath( _url ),
                listWidget = {
                    "name": "browser.list",
                    "data": {
                        "name": _data.name,
                        "path": _url
                    }
                };
console.log("addList " + _data.name + " start.");
            if (typeof parent == 'undefined')
                return;
            else {
                // 檢查父層資料夾原先是否有資料夾
                // 若沒有，則在父層新增"可開啟子資料夾"圖示
                if (!parent.children('div#indicator').hasClass('indicator'))
                    parent.children('div#indicator').addClass('indicator');
                elucia.addTo( listWidget, parent, function() {
console.log("addList " + _data.name + " done.");
                    if (_add) {
                        addFileToContent( _data, "folder", _url, _callback );
                    }
                    else {
                        todo--;
console.log("L131:todo is " + todo);
                        if (todo == 0) 
                            destroy();
                        else
                            _callback && _callback(); 
                    }   
                });
            }
        },

        findSameName = function( _name, _type ) {
            var divFile = "div.browser div.content div#file";
            for(var i = 0;i < $(divFile).length;i++) {
                var fileType = $(divFile + " div.type:eq("+i+")").text();
                var fileName = $(divFile + " div.name:eq("+i+")").text();
                if( fileType == _type && fileName == _name ) {
                    return true;
                }
            }
            return false;
        },

        getParentFolderPath = function( _url ) {
            // 此函式功能為在資料夾樹狀結構清單中找出上層資料夾路徑
            // 藉由這個路徑得知樹狀清單中的上層資料夾
            var divBrowser = node.parent().parent(),
                divNav = divBrowser.children('div.operate').children('div.nav'),
                curr_path = _url;

            curr_path = curr_path.slice(0,-1);
            var index = curr_path.lastIndexOf('/');
            if (index == -1)
                return divBrowser.children('div.list').children('div.folder');
            else {
                curr_path = curr_path.slice(0,index+1);
                var divFolder = divBrowser.children('div.list').children('div.folder')
                    .find('div.path').filter(function() {
                        return $(this).text() === curr_path; 
                    }).parent();
                return divFolder;
            }
        },

        postMetadata = function( _data, _url, _add, _callback ) {
            var metaUrl = "./meta/";

            if (typeof _add === 'undefined')
                _add = true;
            elucia.rest.post({
                'url': metaUrl.concat(_url),
                success: function( _res ) {
                    console.log("postMetadata " + _data.name + " done.");
                    if (_res.result == 1)
                        addListToContent( _data, _url, _add, _callback );
                }
            });
        },

        postXHR = function( _data, _dir, _add ) {
            var xhr = new XMLHttpRequest(),
                formData = new FormData(),
                progress = document.createElement('progress');

            if (typeof _add === 'undefined') 
                _add = true;

            xhr.open('POST', './file/' + _dir);
            xhr.setRequestHeader('Authorization', 'Bearer ' + configuration.user.token);
            if (_add) {
                progress.min = 0;
                progress.max = 100;
                progress.value = 0;
                node.append(progress);
            }
            
            xhr.onload = function() {
                console.log('xhr ' + _data.name + ' upload done.');
                progress.remove();
                
                if (_add) 
                    addFileToContent( _data, _data.type, _dir );
                else {
                    todo--;
console.log("L214:todo is " + todo);
                    if (todo == 0) destroy();
                }
            };

            if ("upload" in new XMLHttpRequest) {
                console.log('xhr ' + _data.name + ' upload start.');
                if (_add) {
                    xhr.upload.onprogress = function (event) {
                        if (event.lengthComputable) {
                            var complete = (event.loaded / event.total * 100 | 0);
                            progress.value = complete;
                        }
                    }
                }       
            }          
            formData.append(_data.name, _data);
            xhr.send(formData);
        },

        putXHR = function( _data, _dir ) {
            var xhr = new XMLHttpRequest(),
                formData = new FormData();

            xhr.open('PUT', './file/' + _dir);
            xhr.setRequestHeader('Authorization', 'Bearer ' + configuration.user.token);

            xhr.onload = function() {
                elucia.debug('put xhr upload done.');
                todo--;
                if (todo == 0) destroy();
            };

            formData.append('myfile', _data);
            xhr.send(_data);
        },

        traverseFileTree = function(item, path) {
            path = path || "";
            if (item.isFile) {
              // Get file
              item.file(function(_file) {
                  postXHR( _file, path + _file.name, false );
              });
            } else if (item.isDirectory) {
                // Get folder contents
                var dirReader = item.createReader();
                dirReader.readEntries(function(entries) {
                    todo += entries.length;
console.log("L262:todo is " + todo);
                    for (var i=0; i<entries.length; i++) {                        
                        traverseFileTree(entries[i], path + item.name + '/');
                    }
                });

                postMetadata( item, path + item.name + '/', false );
            }
        },

        destroy = function() {
            elucia.debug("### fileUpload.destroy ###");
            node.remove();
        },
        
        that = {
            init: init,
            destroy: destroy
        };
        
        return that;
    };
    
    return Application;
});