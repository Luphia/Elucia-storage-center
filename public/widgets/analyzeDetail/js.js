define(function()
{
	var Analyze = function()
	{
		var node,
			data,
			max,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data.data;

			this.draw(this.data.disk,this.data.network,this.data.name,_data.max*1.02);
			return this;
		},

		draw = function(_disk,_network,_name,_max)
		{			
			var totalWidth = $("div.content",this.node).width();
			var diskWidth = (_disk/_max)*totalWidth;
			var networkWidth = (_network/_max)*totalWidth;

			$("div.user",this.node).text(_name);
			$("div.content > div.disk",this.node).text(_disk).animate({width:diskWidth});
			$("div.content > div.network",this.node).text(_network).animate({width:networkWidth});
			$("div.money",this.node).html(configuration.fee.networkGB.unit+"&nbsp;&nbsp;&nbsp;&nbsp;"+(_disk+_network));			
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			draw:draw,
			destroy: destroy
		};

		return that;
	}

	return Analyze;
});