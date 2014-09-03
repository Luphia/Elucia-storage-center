define(function()
{
	var counter = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;
			this.lastNumber = 0;

			this.defaultSetting();

			return this;
		},

		defaultSetting = function()
		{
			$('span.counterSpan',this.node).addClass('counter counter-analog').counter(
			{ 
				initial: '0',
	            direction: 'up',
	            interval: '1',
	            format: '9999',
	            stop: '0'
	        });
		},

		setNumber = function(_number,_callBack)
		{
			var format = "";
			var direction = "";
			var numberLength = _number.length;

			//direction
			if(this.lastNumber < _number)
				direction = "up";
			else
				direction = "down";

			//format && _number
			_number = _number.toString();
			for(var i=0; i<numberLength; i++)
			{
				format+= "9";
			}

			if(format.length < 4) 
				format = "9999";

			var data = 
			{ 
				initial: this.lastNumber,
	            direction: direction,
	            interval: '1',
	            format: format,
	            stop: _number
	        };
	       
	        this.lastNumber = _number; 
	        console.log(data);
			$('span.counterSpan',this.node).counter(data);						
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			defaultSetting:defaultSetting,
			setNumber:setNumber,
			destroy: destroy
		};

		return that;
	}

	return counter;
});