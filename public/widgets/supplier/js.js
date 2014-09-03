define(function() 
{	
	var supplierDetail = function() 
	{	
		var node,
			data,
			disk,
			memory,
			disk_unit,
			memory_unit,

		init = function(_node, _data) 
		{
			this.node = _node;
			this.data = {
				"name": "III",
				"id": 10,
				"status": 1,
                "machine_ip": "140.92.143.23:3000",
                "contact": "台北市松山區民生東路4段133號"
			};
			this.disk = null;
			this.disk_unit = "Byte";
			this.memory = null;
			this.memory_unit = "Byte";
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
			$("div.supplierInfo div.name",this.node).text(this.data.name);
			$("div.supplierInfo div.machine_ip",this.node).text(this.data.machine_ip);

			if(this.data.status == 1)
			{
				var id = this.data.id;
				$("div.cpu div.graph div.utility", this.node).prop("id","cpu_"+id+"_"+this.uuid);
				$("div.cpu div.text", this.node).prop("id","cpu_"+id+"_"+this.uuid);
				$("div.memory div.graph", this.node).prop("id","memory_"+id+"_"+this.uuid);
				$("div.disk div.graph", this.node).prop("id","disk_"+id+"_"+this.uuid);	

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
			that.drawMemory(_data.data.ram);
			that.drawDisk(_data.data.disk);
			that.drawNetwork(_data.data.network);	 
		},

		drawCpu = function(_data)
		{
			$("div.cpu div.text",this.node).text(_data.loading+"%");
			var rate = _data.loading*2;
			$("div.cpu div.utility",this.node).css("width",rate + 'px');
		},

		drawDisk = function(_data)
		{
			var that = this;
			disk_unit = elucia.displayByte(_data.loading)[1];

			this.disk = new JustGage(
			{
	          	id: "disk_"+this.data.id+"_"+that.uuid, 
	          	value: elucia.displayByte(_data.loading,undefined,disk_unit)[0],
	          	min: 0,
	          	max: elucia.displayByte(_data.total,undefined,disk_unit)[0],
	          	title: "disk loading",
	          	label: "disk usage(" + disk_unit + ")"
	        });

			// 版面微調
			// 移除 JustGage 內建 title
			// 因為移除內建標題，所以將 svg 位置上移
	        $("div.disk svg text:contains('disk loading')", this.node).remove();
	        $("div.disk svg", this.node).css('top', "-30px");
		},

		drawMemory = function(_data)
		{
			var that = this;
			memory_unit = elucia.displayByte(_data.loading)[1];

			// 使用JustGage plugin需注意div長寬，否則畫面會跑掉
			this.memory = new JustGage(
			{
	          	id: "memory_"+this.data.id+"_"+that.uuid, 
	          	value: elucia.displayByte(_data.loading,undefined,memory_unit)[0],
	          	min: 0,
	          	max: elucia.displayByte(_data.total,undefined,memory_unit)[0],
	          	title: "memory loading",
	          	label: "memory usage(" + memory_unit + ")"
	        });

			// 版面微調
			// 取消 JustGage 內建 title
			// 因為移除內建標題，所以將 svg 位置上移
	        $("div.memory svg text:contains('memory loading')", this.node).remove();
	        $("div.memory svg", this.node).css('top', "-30px");
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
			    		"size": {
			    			"width": 285,
			    			"height": 135
			    		}
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
			$("div.cpu div.text #cpu_"+that.data.id+"_"+this.uuid,this.node).text(_data.data.cpu.loading+"%");
			var rate = _data.data.cpu.loading*2;
			$("div.cpu div.graph div.utility",this.node).css("width",rate+'px');

			//memory
			that.memory && that.memory.refresh(elucia.displayByte(_data.data.ram.loading,'Byte',memory_unit)[0]);

			//disk
			that.disk && that.disk.refresh(elucia.displayByte(_data.data.disk.loading,'Byte',disk_unit)[0]);	

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
			parseInfo: parseInfo,
			drawCpu: drawCpu,
			drawNetwork: drawNetwork,
			drawDisk: drawDisk,
			drawMemory: drawMemory,
			update: update,
			destroy: destroy
		};

		return that;
	};

	return supplierDetail;
});