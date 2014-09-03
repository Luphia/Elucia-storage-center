define(function() 
{	
	var supplierMonitor = function() 
	{
		var node,
			data,

		init = function(_node, _data) 
		{
			//$("div.login").slideUp();
			this.retry = 0;
			this.node = _node;
			this.data = _data;
			this.children = [];

			this.getTotalWidget();
			this.getListWidget();
			//this.getMapWidget();
			
			return this;
		},

		getTotalWidget = function()
		{
			var tmpWidget = 
			{
		       	"name": "supplierMonitorTotalInfo",
		    	"data": {}
		    },

		    that = this;
			elucia.addTo(tmpWidget, $("div.supplierTotalInfo", this.node), function(_node, _data, _obj) 
			{
				that.children.push(_obj);
			});
		},

		getListWidget = function()
		{
			var that = this;

			elucia.rest.get(
			{
				url: "/manage/supplier",
				success: function(_data) 
				{
					if(_data.result == 1)
					{
					    for(var key in _data.data)
					    {
					    	var tmpWidget = 
							{
						       	"name": "supplierMonitorList",
						    	"data": 
						    	{
						    		"name":_data.data[key].name,
						    		"ip":_data.data[key].machine_ip,
						    		"status":_data.data[key].status,
						    		"id":_data.data[key].id
						    	}
						    };
						    elucia.addTo(tmpWidget, $("div.supplierItem", that.node));
					    }
					} 				
				}
			});    			
		},

		getMapWidget = function()
		{
			var tmpWidget = 
			{
		       	"name": "supplierMonitorGoogleMap",
		    	"data": {}
		    };
		    elucia.addTo(tmpWidget, $("div.mapDiv", this.node));
		},

		destroy = function() 
		{
			for(var key in this.children) 
			{
				this.children[key].destroy();
			}

			delete this;
		},

		that = 
		{
			init: init,
			getTotalWidget:getTotalWidget,
			getListWidget:getListWidget,
			getMapWidget:getMapWidget,
			destroy: destroy
		};

		return that;
	};

	return supplierMonitor;
});
