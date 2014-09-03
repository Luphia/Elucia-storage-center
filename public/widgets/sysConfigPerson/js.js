define(function()
{
	var sysConfigPerson = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;

			var h = (this.data.expireTime/3600).toString().split(".")[0],
				i = ((this.data.expireTime-h*3600)/60).toString().split(".")[0],
				s = this.data.expireTime-h*3600-i*60;


			$("input[name=tokenTimeH]",this.node).val(h);
			$("input[name=tokenTimeI]",this.node).val(i);
			$("input[name=tokenTimeS]",this.node).val(s);

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

	return sysConfigPerson;
});