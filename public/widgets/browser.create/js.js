define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
			data,

		init = function(_node, _data) {
			node = _node;
			this.data = _data;

			$('div.create > div#icon').hover(function() {
				$(this).addClass('hover');
			}, function() {
				$(this).removeClass('hover');
			});

            $("div.create > div#icon").click(function() {
        		var path = getPath();
        		if( typeof path == 'undefined' || path == null ) {
        			elucia.confirm("搜尋狀態下，無法建立資料夾");
        		}
        		else {
        			var dt = new Date();
        			var tmpWidget = {
        				"name": "browser.newFolder",
        				"data": {
        					"date": dt.getTime(),
        					"type": "folder",
        					"size": 0,
        					"path": path
        				}
        			};
        			var divContent = findDivContent(_node);
        			elucia.addTo( tmpWidget, divContent, function(_callbackNode, _callbackData, _obj) {
        				if( typeof _obj == 'undefined' || _obj == null )
        					elucia.debug("### newFolder.destroy(他殺) ###");
        				else {
        					_obj.setViewModel();
        					scrollToNewFolder(_node);
        				}	
        			});
        		} 
            });
			return this;
		},

		findDivContent = function(_node) {
			if(typeof _node == 'undefined' || _node == null) 
				return null;
			else {
				var divContent = _node.parent().parent().children("div.content");
				return divContent;
			}
		},

		getPath = function() {
			var path = node.parent().children("div.nav").children("div#path").text();
			if( typeof path == 'undefined' || path == null )
				return null;
			else if( path.search('/') == -1 )
				return null;
			else {
				path = path.slice(1);
				return path;
			}
				
		}

		scrollToNewFolder = function(_node) {
			console.log("### browser.create scrollToNewFolder ###");
			var divContent = _node.parent().parent().children("div.content");
        	divContent.scrollTop(divContent[0].scrollHeight);
		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		destroy = function() {
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