define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
			data,
            view,

		init = function(_node, _data) {
			node = _node;
            if( typeof(_data) == "undefined" || _data == null )
                view = "grid";
            else
                view = _data;
        
            $('div#icon', _node).hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });

            $('div#icon', _node).click(function() {
                if( view==="grid" ) {
                    $(this).removeClass().addClass("viewDetail");
                    $(this).prop('title', "Switch to Grid");
                    $("div.browser div.operate div.view div.model").text("list");
                    updateData( "list" );
                }
                else {
                    $(this).removeClass().addClass("viewIcon");
                    $(this).prop('title', "Switch to List");
                    $("div.browser div.operate div.view div.model").text("grid");
                    updateData( "grid" );
                }  
            });
			return this;
		},

    changeView = function( _view ) {
        var divFile = $("div.browser div.content div#file"),
            newFolder = $("div.browser div.content div#newfolder");

        if( _view==="list" ) {
            $('div.browser div.table').show();
            divFile.removeClass("grid").addClass("list");
            divFile.children().css("float","left");
            divFile.children("div#icon").removeClass("standard").addClass("small");
            divFile.children("div.date").css("display","inline");
            divFile.children("div.size").css("display","inline");
            divFile.children("div.visible_path").css("display","inline");

            newFolder.removeClass("grid").addClass("list");
            newFolder.children().css("float","left");
            newFolder.children("div#icon").removeClass("standard").addClass("small");
            newFolder.children("div.date").css("display","inline");
            newFolder.children("div.size").css("display","inline");
            newFolder.children("div.visible_path").css("display","inline");
        }
        else {
            $('div.browser div.table').hide();
            divFile.removeClass("list").addClass("grid");
            divFile.children().css("float","none");
            divFile.children("div#icon").removeClass("small").addClass("standard");          
            divFile.children("div.date").css("display","none");
            divFile.children("div.size").css("display","none");
            divFile.children("div.visible_path").css("display","none");

            newFolder.removeClass("list").addClass("grid");
            newFolder.children().css("float","none");
            newFolder.children("div#icon").removeClass("small").addClass("standard");          
            newFolder.children("div.date").css("display","none");
            newFolder.children("div.size").css("display","none");
            newFolder.children("div.visible_path").css("display","none");
        }
    },

	getData = function() {
        return view;
	},

	updateData = function( _view ) {
        view = _view;
        changeView( _view );
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