define(function()
{
	var sysConfigFile = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;

			var i = parseInt((this.data.fileRepairPeriod/1000/60).toString().split(".")[0]),
				s = parseInt((this.data.fileRepairPeriod-i*60*1000)/1000);

			$("input[name=fileRepairI]",that.node).val(i);
			$("input[name=fileRepairS]",that.node).val(s);
			$("input[name=fileReplication]",that.node).val(this.data.fileStrategy.replication);

			return this;
		},

		destroy = function() 
		{

		},

		that = 
		{
			init: init,
			destroy: destroy
		};

		return that;
	}

	return sysConfigFile;
});