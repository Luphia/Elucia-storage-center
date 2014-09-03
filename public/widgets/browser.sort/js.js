define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
			  data,

		init = function(_node, _data) {
			  this.node = _node;
			  this.data = _data;
 
        var deg = 0;
        $("div#icon", _node).click(function(event) {
            deg = ( deg == 0 ) ? 180 : 0;
            $(this).css("transform","rotate("+deg+"deg)");
            var method = $(this).parent().parent().children('div.table_td').text();
            updateData( method, deg );
        });

			  return this;
		},

		getData = function() {
        elucia.debug("### appliaction.getData ###");
		},

		updateData = function( _method, _deg ) {
			  var fileArray = []; //JavaScript Array Object才可以使用sort方法
        var folderArray = []; //資料夾依照名稱排序，因此另建一個陣列存放資料夾名稱
        var divFile = "div.browser div.content div#file";
        var fileIndex = 0;
        var folderIndex = 0;

        _method = _method.toLowerCase();
        if( _method == "name" ) {
          // 抓出div.content中所有div.file的檔案名稱，存入data陣列中
          for(var i = 0;i < $(divFile).length;i++) {
            var fileType = $(divFile + " div.type:eq("+i+")").text();
            var fileName = $(divFile + " div.name:eq("+i+")").text();
            if( fileType == "folder" ) {
              folderArray[fileIndex++] = fileName; 
            }
            else {
              fileArray[folderIndex++] = fileName;
            }
          }
          fileArray.sort(); // 依據檔名字母順序由A至Z排序
          folderArray.sort(); // 依據資料夾名稱字母順序由A至Z排序
          if(_deg==0) { // 箭頭向下，遞減排序
            fileArray.reverse(); // 檔名由Z至A排序
            folderArray.reverse(); // 資料夾名稱由Z至A排序
            // 先排檔案，再排資料夾
            // 按照排序好的fileArray陣列，找出內容含有相同檔名的div.file重新加入div.content
            arraySort( fileArray, _method, 'file' ); 
            arraySort( folderArray, _method, 'folder' );
          }
          else {
            // 名稱遞增排序，先排資料夾，再排檔案
            arraySort( folderArray, _method, 'folder' );
            // 按照排序好的fileArray陣列，找出內容含有相同檔名的div.file重新加入div.content
            arraySort( fileArray, _method, 'file' );
          }  
        }
        else if( _method == "date" ) {
            for(var i = 0;i < $(divFile).length;i++) {
                fileArray[i] = $(divFile + " div.msecond:eq("+i+")").text();
            }
          
            fileArray.sort();
            if(_deg==0)
                fileArray.reverse();
            $.each( fileArray, function( index, value ) {
                $(divFile + " div.msecond").filter(function() {
                    return $(this).text() === value; 
                }).parent().appendTo("div.browser div.content");
            });  
        }
        else if( _method == "size" ) {
          for(var i = 0;i < $("div.browser div.content div#file").length;i++) {
            // 將資料夾名稱存入dataArray陣列，將檔案大小存入data陣列
            if( $("div.browser div.content div#file div.type:eq("+i+")").text() == "folder" ) {
              folderArray[fileIndex++] = $(divFile + " div.name:eq("+i+")").text();
            }
            else {
              fileArray[folderIndex++] = $(divFile + " div.size:eq("+i+")").text();
            }
          }
          fileArray.sort(function(a,b){return a-b}); // 將檔案大小由小至大排序
          folderArray.sort(); // 將資料夾依照名稱排序          
          if(_deg==0) { // 若箭頭朝下，則依照檔案大小遞減排序
            fileArray.reverse(); // 將檔案大小由大至小排序
            // 先插入檔案，再插入資料夾
            arraySort( fileArray, _method, 'file' );
            arraySort( folderArray, 'name', 'folder' );
          }
          else {
            // 先插入資料夾，再插入檔案
            arraySort( folderArray, 'name', 'folder' );
            arraySort( fileArray, _method, 'file' );
          }   
        }
        elucia.debug("### appliaction.updateData ###");
		},

    arraySort = function( _array, _rule, _type ) {
        // 參數 _array 為排序好的陣列
        // 參數 _rule 為排序規則，例如名稱或檔案大小
        // 參數 _type 為檔案型態，因為資料夾與檔案分別排序
        if( typeof _array === 'undefined' || _array == null )
            return;

        var divContent = "div.browser div.content",
            divFile = divContent + " div#file";

        if( _type == 'folder' ) {
            $.each( _array, function( index, value ) {
                if (_rule == "name") {
                    $(divFile).filter(function() {
                        return $(this).children('div.name').text() === value &&
                        $(this).children('div.type').text() == _type; 
                    }).appendTo(divContent);
                }
                else {
                    $(divFile).filter(function() {
                        return $(this).children('div.' + _rule).text() === value &&
                        $(this).children('div.type').text() == _type; 
                    }).appendTo(divContent);
                }
            });
        }
        else {
            $.each( _array, function( index, value ) {
                if (_rule == "name") {
                    $(divFile).filter(function() {
                        return $(this).children('div.name').text() === value &&
                        $(this).children('div.type').text() != 'folder'; 
                    }).appendTo(divContent);
                }
                else {
                    $(divFile).filter(function() {
                        return $(this).children('div.' + _rule).text() === value &&
                        $(this).children('div.type').text() != 'folder'; 
                    }).appendTo(divContent);
                }
            });
        }
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