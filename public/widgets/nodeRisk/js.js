define(function()
{
	var nodeRisk = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			
			this.children = [];
			this.totalChildren = [];

			//first
			this.getData();

			//crod job
			myMonitors["resource"] = elucia.monitors.addMonitor(
			{
				id: "",
				url: "/nodeRisk",
				method: "get",
				period: 3000
			});

			this.listener = myMonitors["resource"].regist(
			{
				"action": $.proxy(this, "updateData")
			});

			return this;
		},	

		getData = function()
		{
			var that = this;
			elucia.rest.get(
			{
				url: "/nodeRisk",
				success: function(_data) 
				{
					if(_data.result == 1)
					{
						that.data = _data.data.node;
						if(that.data.length > 0)
						{	
							//first
							that.getNodeContent(that.data,function()
							{
								that.sort(that.children,function(_children)
								{
									for(var key in _children) 
									{
										_children[key].node.prependTo("div.nodeRisk div.nodeInfo");
									}				
								});				
							});	

							//total info
							if(that.totalChildren.length == 0)
								that.getTotalInfo(_data.data.totalInfo);
							else
								that.updateTotalInfo(_data.data.totalInfo);								
						}						
					}
				}
			});
		},

		updateData = function(_data)
		{
			this.updateTotalInfo(_data.data.totalInfo);
			this.updateNodeContent(_data.data.node);
		},

		getTotalInfo = function(_totalInfo)
		{
			var tmpWidget = 
			{
		       	"name": "nodeRiskInfo",
		    	"data": 
		    	{
		    		"data":_totalInfo
		    	}		    	
		    }

		    var that = this;
			elucia.addTo(tmpWidget, $("div.totalInfo", this.node), function(_node, _data, _obj) 
			{
				that.totalChildren.push(_obj);
			});
		},

		updateTotalInfo = function(_totalInfo)
		{
			for(var key in this.totalChildren)
			{
				this.totalChildren[key].update(_totalInfo);
			}
			//console.log(_totalInfo);
		},

		getNodeContent = function(_data,_callBack)
		{
			var orinData = _data;
			for(var key in _data)
			{
				var tmpWidget = 
				{
			       	"name": "nodeRiskContent",
			    	"data": 
			    	{
			    		"data":_data[key]
			    	}		    	
			    }

			    var that = this;
				elucia.addTo(tmpWidget, $("div.nodeInfo", this.node), function(_node, _data, _obj) 
				{
					that.children.push(_obj);
					if(orinData.length == that.children.length)
					{
						_callBack();
					}
				});
			}				
		},

		updateNodeContent = function(_data)
		{
			if(_data.length > 0)
			{
				var that = this;
				checkNode(_data,function(check)
				{
					if(check == 0)
					{	
						for(var key in that.children)
						{
							for(var key2 in _data)
							{
								if(that.children[key].data.ip == _data[key2].ip)
								{
									var drawdata = [];
									if(_data[key2].status == 1)
									{
										drawdata = 
										[
											{"name": "risk",  "risk": parseInt(_data[key2].risk)},
											{"name": "safe",  "risk": 100-parseInt(_data[key2].risk)},
											{"name": "bad",  "risk": 0}
										]
									}
									else
									{
										drawdata = 
										[
											{"name": "risk",  "risk": 0},
											{"name": "safe",  "risk": 0},
											{"name": "bad",  "risk": 100}
										]
									}
						
									that.children[key].update(_data[key2],drawdata);
								}
							}
						}						
					}
					else if(check == 1 || check == 2)
					{	
						for(var key in that.children)
						{
							 that.children[key].destroy();

							 if(typeof that.children[parseInt(key)+1] == "undefined")
							 {
							 	that.children = [];				 	
						 		that.getData();				 		 	
							 }
						}
					}
					else
					{}						
				});		
			}		
		},

		checkNode = function(_data,_callBack)
		{	
			//console.log(_data.length + " : "+ that.children.length);
			if(_data.length == that.children.length)
			{
				var checkArray = [];
				for(var key in _data)
				{
					var check = false;
					for(var key2 in that.children)
					{
						if(_data[key].ip == that.children[key2].data.ip)
						{
							check = true;
							break;
						}
					}

					if(!check)
						checkArray.push(_data[key].ip);

					if(checkArray.length > 0)
						_callBack(1);
					else
						_callBack(0);
				}
			}
			else if(_data.length < that.children.length || _data.length > that.children.length)
				_callBack(2);			
			else if(_data.length == 0)
				callBack(3);
		},

		sort = function(_children,_callBack)
		{
			var length = _children.length;

			for(var i=0; i<length; i++) 
			{
				for(var j=0;j<length;j++)
				{
					if(_children[i].data.risk < _children[j].data.risk)
					{
						var t = _children[i];
						_children[i] = _children[j];
						_children[j] = t;
					}
				}
			};

			_callBack(_children);

		},

		destroy = function() 
		{	
			//remove listener
			myMonitors["resource"].unregist(this.listener);

			for(var key in this.children)
			{
				this.children[key].destroy();
			}
		},

		that = 
		{
			init: init,
			sort:sort,
			getData:getData,
			updateData:updateData,
			getTotalInfo:getTotalInfo,
			getNodeContent:getNodeContent,
			updateTotalInfo:updateTotalInfo,
			updateNodeContent:updateNodeContent,
			checkNode:checkNode,
			destroy: destroy
		};

		return that;
	}

	return nodeRisk;
});