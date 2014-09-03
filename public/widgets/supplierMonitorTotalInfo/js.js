define(function() 
{	
	var supplierTotalInfo = function() 
	{
		var node,
			data,

		init = function(_node, _data) 
		{
			this.node = _node;
			this.data = _data;
			this.listener = null;

			//first
			this.getTotalInfo();

			//more times
			var that = this;
			myMonitors["resource"] = elucia.monitors.addMonitor(
			{
				id: "",
				url: "/summary/summaryInfo",
				method: "get",
				period: 5000
			});

			this.listener = myMonitors["resource"].regist(
			{
				"action": $.proxy(this, "getTotalInfo")
			});

			return this;
		},

		getTotalInfo = function(_data)
		{
			if(typeof _data == "undefined")
			{
				var that = this;
				elucia.rest.get(
				{
					url: "/summary/summaryInfo",
					success: that.parseInfo
				});  
			}	
			else
				this.parseInfo(_data);
		},

		parseInfo = function(_data) 
		{
			if(_data.result == 1) 
			{
				//total disk
				$("div.subTotalInfo div.totalDisk",that.node).text(elucia.displayByte(_data.data.totalDisk)[2]);	

				//usage disk
				$("div.subTotalInfo div.diskUsage",that.node).text(elucia.displayByte(_data.data.diskUsage)[2]);					
				var fullHeight = $("div.subTotalInfo > div.totalSpace div.water").height();
				var tmpHeight =  _data.data.diskUsage/_data.data.totalDisk*fullHeight;
				$("div.subTotalInfo > div.usageSpace div.water").animate({height:tmpHeight})

				//avalibility
				$("div.subTotalInfo div.avalibility",that.node).text(_data.data.avalibility+"%");	
				var tmpWidth = _data.data.avalibility*$("div.subTotalInfo div.avalibilityContent div.main",that.node).width()/100;
				$("div.subTotalInfo div.avalibilityContent div.graph",that.node).animate({width:tmpWidth})	
			}
		},

		destroy = function() 
		{
			myMonitors["resource"].unregist(this.listener);
			this.node.remove();
		},

		that = 
		{
			init: init,
			getTotalInfo:getTotalInfo,
			parseInfo: parseInfo,
			destroy: destroy
		};

		return that;
	};

	return supplierTotalInfo;
});
