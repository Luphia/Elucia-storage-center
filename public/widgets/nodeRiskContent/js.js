define(function()
{
	var nodeRiskContent = function()
	{
		var node,
			data,
			_current;

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data.data;
			this._current = null;

			if(_data.data.status == 1)
			{
				this.drawdata = 
				[
					{"name": "risk",  "risk": this.data.risk},
					{"name": "safe",  "risk": 100-this.data.risk},
					{"name": "bad",  "risk": 0}
				]
			}
			else if(_data.data.status == 0)
			{
				this.drawdata = 
				[
					{"name": "risk",  "risk": 0},
					{"name": "safe",  "risk": 0},
					{"name": "bad",  "risk": 100}
				]
			}		
			
			this.draw();
			
			return this;
		},

		draw = function()
		{
			var width = 255,
		    	height = 255,
		    	radius = Math.min(width, height) / 2;

			var color = d3.scale.ordinal().range(["#f85032","#299a0b","#A9A9A9"]);

			this.arc = d3.svg.arc().outerRadius(radius-25).innerRadius(radius-60);

			this.pie = d3.layout.pie().sort(null).value(function(d) {return d.risk;});

			var tmpNode = $("div.subNodeRisk", this.node)[0];
			this.svg = d3.select(tmpNode).append("svg")
										 .attr("width", width)
										 .attr("height", height)
										 .append("g")
										 .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			this.path = this.svg.datum(this.drawdata).selectAll("path")
												     .data(this.pie)
												     .enter().append("path")
												     .attr("fill", function(d, i) { return color(i); })
												     .attr("d", this.arc)
												     .each(function(d){this._current = d;});


			this.g = this.svg.selectAll(".arc").data(this.pie(this.drawdata))
									           .enter()
									           .append("g")
									           .attr("class", "arc");

			this.setInfo(this.data);  
		},

		update = function(_data,_drawdata)
	  	{
		    this.pie.value(function(d) {return d["risk"]; }); // change the value function
		
		    this.path = this.path.data(this.pie(_drawdata)); // compute the new angles
		    this.path.transition().duration(750).attrTween("d", that.arcTween); // redraw the arcs

		    this.setInfo(_data,_drawdata);
	  	},

  		arcTween = function(a)
	  	{
			var i = d3.interpolate(this._current, a);
		    this._current = i(0);
		    return function(t) 
		    {
		    	return that.arc(i(t));
		    };
	  	}

		setInfo = function(_data,_drawdata)
		{		
			// console.log(_data);
			$("div.subNodeInfo > div:nth-child(1)",this.node).text(_data.name);
			$("div.subNodeInfo > div:nth-child(2)",this.node).text(_data.ip);
			$("div.fileNum > div:nth-child(2)",this.node).html(_data.fileCount);
			$("div.totalSpace > div:nth-child(2)",this.node).html(elucia.displayByte(_data.totalSpace)[0]+elucia.displayByte(_data.totalSpace)[1]);
			$("div.useSpace > div:nth-child(2)",this.node).html(elucia.displayByte(_data.useSpace)[0]+elucia.displayByte(_data.useSpace)[1]);

			if(typeof _drawdata == "undefined")
			{			
				$("div.colorInfo > div:nth-child(2)",this.node).text(_data.risk+"%");
			}
			else
			{
				$("div.colorInfo > div:nth-child(2)",this.node).text(_drawdata[0].risk+"%");
			}		
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			draw:draw,
			update:update,
			arcTween:arcTween,
			setInfo:setInfo,
			destroy: destroy
		};

		return that;
	}

	return nodeRiskContent;
});