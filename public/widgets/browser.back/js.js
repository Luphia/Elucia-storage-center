define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var root = "meta",

		init = function(_node, _data) {
        $('div.back > div#icon').hover(function() {
            $(this).addClass('hover');  
        }, function() {
            $(this).removeClass('hover');
        });

        $("div.back > div#icon").click(function() {
            var folderUrl = getFolderUrl();
            if( typeof folderUrl === 'string' )
                getData( folderUrl );
        });
			 return this;
		},

		getData = function( _path ) {
        var fileWidget = {
            "name": "browser.file",
            "data": []
        };
        elucia.addTo(fileWidget, "", function( _callbackNode, _callbackData, _obj ){
            _obj.addData( _path );
        });
        return 0;
		},

    getFolderUrl = function() {
        var virtual_path = $("div.browser div.operate div.nav div#path").text();
        var lastIndex = virtual_path.lastIndexOf('/');
      
        if( lastIndex <= 0 )
            return;
        else {
            virtual_path = virtual_path.slice(0,lastIndex);
            lastIndex = virtual_path.lastIndexOf("/");
            virtual_path = virtual_path.slice(0,lastIndex+1);
            var actual_path = "./".concat( root.concat(virtual_path) );
            return actual_path;
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