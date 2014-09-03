define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
			data,
			count,

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;

			var self = this;
            _node.keyup(function(event) {
				if( event.which==13 ) {
          			self.count = 0;
          			$("div.browser div.content").empty();
          			$("div.browser div.operate div#path").text( "search " + $("#txt").val() );
          			self.getData("./meta/");
        		}    
			});

			return this;
		},

		getData = function( _path ) {
			var self = this;
			elucia.rest.get({
        		url: _path,
				success: function(_data) {
            		var fileList = _data.data.files;

            		for(var key in fileList) {
            	  		var fileName = fileList[key].name,
            	  			fileType = fileList[key].type;

            	  		if( fileType == "folder" ) {
            	    		fileUrl = _path + fileName + '/';
            	    		self.getData( fileUrl );
            	        } 
            	  		if( fileName.match( $("#txt").val() ) ) {
            	    		self.count++;
            	    		var tmpWidget = {
						        "name": "browser.file",
						        "data": fileList[key]
				    	    };
				    	    elucia.addTo(tmpWidget, $("div.browser div.content"), function( _callbackNode, _callbackData, _obj ) {
            	    	    	_obj.setViewModel();
            	    	    	$("div.browser div.operate div#path").text( "search " + $("#txt").val() + ' - ' + self.count + ' results');
            	    	    });
            	    	}  
            	    }
        		}
			});
        	return true;
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