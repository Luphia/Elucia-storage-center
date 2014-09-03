define(function() 
{
	var table = function() 
	{
		var node,
			data,

		init = function(_node, _data) 
		{
			// elucia.loadTemplate("table",this);

			this.node = _node;
			this.data = _data;

			this.getData();

			return this;
		},

		getData = function()
		{
			var currRender = $.proxy(this, "draw");
			elucia.rest.get(
			{
				url: "/manage/client",
				success: function(_data) 
				{
					currRender(_data);
		          	// currRender(_data.data);	      
				}
			});      
		},

		draw = function(_data)
		{
			tb = $("table.clientList tbody");
			if(_data.result == 1)
			{
				data = 	_data.data;					
				for(var key in data)
				{
					tr = $("<tr></tr>").appendTo(tb);
					$("<td></td>").text(data[key].machine_number).appendTo(tr); 
					$("<td></td>").text(data[key].machine_ip).appendTo(tr); 
					$("<td></td>").text(data[key].machine_name).appendTo(tr); 
					$("<td></td>").text(data[key].contact).appendTo(tr); 
					$("<td></td>").text(data[key].status).appendTo(tr); 
				}
			}
		},

		render = function(_data) {
			var newNode = this.template.tmpl(_data);
			newNode.appendTo(this.node);
		},

		destroy = function() 
		{

		},

		that = 
		{
			init: init,
			getData: getData,
			render: render,
			draw : draw,
			destroy: destroy
		};

		return that;
	};

	return table;
});