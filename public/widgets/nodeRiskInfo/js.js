define(function()
{
	var nodeRiskInfo = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;
			
			this.update(_data.data);

			return this;
		},

		update = function(_data)
		{
			this.updateDanger(_data);
			this.updateLive(_data);
			this.updateRisk(_data);
		},

		updateDanger = function(_data)
		{
			$("div.danger div.show > div:nth-child(1)",this.node).text(Math.round((_data.totalDanger/_data.totalFile)*10000)/100+"%");
			$("div.danger div.show > div:nth-child(2)",this.node).text(_data.totalDanger+" of "+_data.totalFile);
		},

		updateLive = function(_data)
		{	
			$("div.live div.show > div:nth-child(1)",this.node).text(Math.round((_data.liveStatus/_data.totalNode)*10000)/100+"%");
			$("div.live div.show > div:nth-child(2)",this.node).text(_data.liveStatus+" of "+_data.totalNode);
		},

		updateRisk = function(_data)
		{
			$("div.riskNode div.show > div:nth-child(1)",this.node).text(Math.round((_data.riskCount/_data.totalNode)*10000)/100+"%");
			$("div.riskNode div.show > div:nth-child(2)",this.node).text(_data.riskCount+" of "+_data.totalNode);
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			update:update,
			updateDanger:updateDanger,
			updateLive:updateLive,
			updateRisk:updateRisk,
			destroy: destroy
		};

		return that;
	}

	return nodeRiskInfo;
});