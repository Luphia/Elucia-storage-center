define(function() 
{	
	var supplierList = function() 
	{
		var node,
			data,

		init = function(_node, _data) 
		{
			this.node = _node;
			this.data = _data;
			this.contentObj = null; //detail widget

			this.drawWidget();

			return this;
		},

		drawWidget = function()
		{
			//add css float
			this.node.addClass(this.data.divLocation);

			$("div.supplierInfo > div:nth-child(1)", this.node).text(this.data.name);
			$("div.supplierInfo > div:nth-child(2)", this.node).text(this.data.ip);

			//check supplier status and add css
			if(this.data.status == 1)
			{
				$("div.supplierstatus", this.node).addClass("good").prop("title","status ok");
				$("div.detail", this.node).addClass("show");					
			}		
			else
			{
				$("div.supplierstatus", this.node).addClass("bad").prop("title","status error");
				$("div.detail", this.node).remove();	
			}
				
			//set clilck to check show or hide
			var currAddWidget = $.proxy(this, "switchDetail");
			$("div.detail",this.node).click(function()
			{	
				currAddWidget();						
			});
		},

		addDetailContent = function(_callBack)
		{
			var tmpWidget = 
			{
			    "name": "supplierDetail",
		    	"data": 
		    	{
		    		"name":this.data.name,
		    		"id":this.data.id,
		    		"ip":this.data.ip,
		    		"status":this.data.status
		    	}
		    };

			var that = this;
			elucia.addTo(tmpWidget, $("div.supplierDetail", this.node), function(_node, _data, _obj) 
			{
				that.contentObj = _obj;
			});		
		},

		switchDetail = function() 
		{
			if($("div.detail", this.node).hasClass("show"))
				this.showDetail();
			else
				this.hideDetail();
		},

		hideDetail = function() 
		{
			$("div.detail", this.node).removeClass("hide").addClass("show");
			$("div.supplierDetail", this.node).slideUp();
		},

		showDetail = function() 
		{
			$("div.detail", this.node).removeClass("show").addClass("hide");
			$("div.supplierDetail", this.node).slideDown();

			// if(!this.contentObj) 
			{
				this.destroy();
				this.addDetailContent();
			}
		}, 

		removeDetailContent = function()
		{
			this.contentObj && this.contentObj.destroy();
		},

		destroy = function() 
		{
			this.contentObj && this.contentObj.destroy();
		},

		that = 
		{
			init: init,
			drawWidget:drawWidget,
			addDetailContent: addDetailContent,
			removeDetailContent: removeDetailContent,
			switchDetail: switchDetail,
			showDetail: showDetail,
			hideDetail: hideDetail,
			destroy: destroy
		};

		return that;
	};

	return supplierList;
});