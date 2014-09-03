define(function()
{
	var sysConfigSys = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;

			var i = parseInt((this.data.supplierMonitorPeriod/60/1000).toString().split(".")[0]),
				s = parseInt((this.data.supplierMonitorPeriod-i*60*1000)/1000);

			$("input[name=sysMonitorPeriodI]",that.node).val(i);
			$("input[name=sysMonitorPeriodS]",that.node).val(s);

			return this;
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			destroy: destroy
		};

		return that;
	}

	return sysConfigSys;
});