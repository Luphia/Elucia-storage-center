define(function() 
{	
	var supplierDetail = function() 
	{	
		var node,
			data,
			disk,

		init = function(_node, _data) 
		{
			this.node = _node;
			this.data = _data;
			this.disk = null;
			this.uuid = Math.uuid();

			this.getData();

			//set interval
			!(myMonitors["supplier_" + this.data.id]) && (myMonitors["supplier_" + this.data.id] = elucia.monitors.addMonitor(
			{
				url: "/summary/summarySupplier/"+this.data.id,
				method: "get",
				period: 2000
			}));

			this.listener = myMonitors["supplier_" + this.data.id].regist(
			{
				"action": $.proxy(this, "update")
			});	

			return this;
		},

		getData = function()
		{
			//status ok
			if(this.data.status == 1)
			{
				var id = this.data.id;
				$("div.cpu > div:nth-child(2)",this.node).prop("id","cpu_"+id+"_"+this.uuid);
				$("div.disk",this.node).prop("id","disk_"+id+"_"+this.uuid);	

				//get data
				var that = this;
				elucia.rest.get(
				{
					url: "/summary/summarySupplier/"+id,
					success: that.parseInfo
				});  
			}		
		},

		parseInfo = function(_data)
		{
			that.drawCpu(_data.data.cpu);
			that.drawNetwork(_data.data.network);
			that.drawDisk(_data.data.disk); 
		},

		drawDisk = function(_data)
		{
			var that = this;
			this.disk = new JustGage(
			{
	          	id: "disk_"+this.data.id+"_"+that.uuid, 
	          	value: elucia.displayByte(_data.loading,undefined,"MB")[0],
	          	min: 0,
	          	max: elucia.displayByte(_data.total,undefined,"MB")[0],
	          	title: "disk loading",
	          	label: "disk usage("+elucia.displayByte(_data.loading)[1]+")"
	        });
		},

		drawCpu = function(_data)
		{
			$("#cpu_"+this.data.id+"_"+this.uuid,this.node).text(_data.loading+"%");
		},

		drawNetwork = function(_data)
		{
			//_data.rx => in,_data.tx => out 
			//data first index => in , data second index => out
			var tmpWidget = 
			{
			    "name": "ChartLine",
		    	"data": 
		    	{
		    		"data":[[0],[0]],
		    		"config": 
			    	{
			    		"width": 50,
			    		"height": 20
			    	}
		    	}		    	
		    };

		    var that = this;
			elucia.addTo(tmpWidget, $("div.network", this.node), function(_node, _data, _obj) 
			{
				that.contentObj = _obj;
			});
		},

		update = function(_data)
		{
			var that = this;

			//cpu
			$("#cpu_"+that.data.id+"_"+this.uuid,this.node).text(_data.data.cpu.loading+"%");

			//disk
			that.disk && that.disk.refresh(elucia.displayByte(_data.data.disk.loading,undefined,"MB")[0]);	

			//network
			that.contentObj && that.contentObj.addData([_data.data.network.rx, _data.data.network.tx]);		
		},

		destroy = function() 
		{
			myMonitors["supplier_" + this.data.id].unregist(this.listener);
			this.node.remove();
		},

		that = 
		{
			init: init,
			getData: getData,
			parseInfo:parseInfo,
			drawCpu:drawCpu,
			drawNetwork:drawNetwork,
			drawDisk:drawDisk,
			update:update,
			destroy: destroy
		};

		return that;
	};

	return supplierDetail;
});