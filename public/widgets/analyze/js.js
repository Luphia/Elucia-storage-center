define(function()
{
	var Analyze = function()
	{
		var node,
			data,
			childrenClient,
			childrenSupplier,
			contant,
			clientMax,
			supplierMax,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;
			this.childrenClient = [];
			this.childrenSupplier = [];
			this.clientMax = 1,
			this.supplierMax = 1;
			this.check = true;

			//預設跑月報
			var now = new Date(),
				starttime = new Date(now.getFullYear(),now.getMonth(),1)*1/1000,
				endTime = new Date(now.getFullYear(),now.getMonth(),now.getDate())*1/1000;

			//宣告標籤點擊事件
			this.tagClick(now,starttime,endTime);	
		
			//default run
			this.draw(starttime,endTime,function(){});

			//每 byte * hour 多少錢
			networkContant = parseInt(configuration.fee.networkGB.value/1000000000);
			diskContant = parseInt(configuration.fee.diskGBH.value/1000000000);

							
			//input range number
			this.rangeChange();	

			return this;
		},

		tagClick = function(_now,_starttime,_endTime)
		{
			//month
			var that = this;
			$("div.tags > div.month").click(function()
			{
				if(that.check == true)
				{
					that.check = false;

					_starttime = new Date(_now.getFullYear(),_now.getMonth(),1)*1/1000;					
					that.resetContent(function()
					{
						that.draw(_starttime,_endTime,function()
						{

							that.check = true;
						});
						
					});							
				}
			});

			//season
			$("div.tags > div.season").click(function()
			{
				if(that.check == true)
				{
					that.check = false;

					_starttime = new Date(_now.getFullYear(),_now.getMonth()-3,1)*1/1000;
					that.resetContent(function()
					{
						that.draw(_starttime,_endTime,function()
						{
							that.check = true;
						});
					});	
				}			
			});

			//year
			$("div.tags > div.year").click(function()
			{
				if(that.check == true)
				{
					that.check = false;

					_starttime = new Date(_now.getFullYear(),0,1)*1/1000;
					that.resetContent(function()
					{
						that.draw(_starttime,_endTime,function()
						{
							that.check = true;
						});
					});	
				}		
			});

			$("div.tags > div.tag:nth(0)",this.node).addClass("cilcked");
			$("div.tags > div.tag",this.node).click(function()
			{
				$("div.tags > div.tag",this.node).removeClass("cilcked");
				$(this).addClass("cilcked");
			});		
		},

		rangeChange = function()
		{
			var that = this;
			//費率試算 income
			$("div.income input[name=contantRangeIncome]",this.node).change(function()
			{
				//show range bumber
				that.msgBox($(this));

				var val = $(this).val();
				for(var key in that.childrenClient)
				{
					var disk = that.childrenClient[key].data.disk,
						network = that.childrenClient[key].data.network,
						name = that.childrenClient[key].data.name;

					that.childrenClient[key].draw(disk*val,network*val,name);							
				}
			}).trigger('change');

			//費率試算 payment
			$("div.payment input[name=contantRangePayment]",this.node).change(function()
			{
				//show range bumber
				that.msgBox($(this));

				var val = $(this).val();
				for(var key in that.childrenSupplier)
				{
					var disk = that.childrenSupplier[key].data.disk,
						network = that.childrenSupplier[key].data.network,
						name = that.childrenSupplier[key].data.name;

					that.childrenSupplier[key].draw(disk*val,network*val,name);							
				}
			}).trigger('change');
		},

		draw = function(_starttime,_endTime,_callback)
		{
			var that = this;
			this.getData(_starttime,_endTime,function(_data)
			{
				that.calc(_data,function()
				{	
					//call functoin to add subwidget
					that.addIncomeDetail(_data.client,that.clientMax);

					//call functoin to add subwidget
					that.addPaymentDetail(_data.supplier,that.supplierMax);

					//finish set check to true
					_callback();
				});			
			}); 	
		},

		getData = function(_starttime,_endTime,_callback)
		{
			elucia.rest.get(
			{
				url: "/dbdata/"+_starttime+"/"+_endTime,
				// url: "/dbdata/1382918400/1382936400",
				success: function(_data) 
				{
					if(_data.result == 1)
					{
						_callback(_data.data);				
					}
				}
			});			
		},

		resetContent = function(_callBack)
		{
			for(var key in that.childrenClient)
				that.childrenClient[key].destroy();

			that.childrenClient = [];

			for(var key in that.childrenSupplier)
				that.childrenSupplier[key].destroy();

			that.childrenSupplier = [];

			_callBack();
		},

		//換算成錢 & 加總
		calc = function(_data,_callback)
		{
			var supplierFlag,clientFlag;

			if(_data.supplier.length > 0)
			{
				//supplier 換算成錢 & 加總
				for(var key in _data.supplier)
				{
					var tmpDisk = parseInt(_data.supplier[key].disk),
						tmpNetork = parseInt(_data.supplier[key].network);

					//cal money
					var tmpSupplierDisk = tmpDisk;
					var tmpSupplierNetwork = tmpNetork;

					_data.supplier[key].disk = tmpSupplierDisk*diskContant;
					_data.supplier[key].network = tmpSupplierNetwork*networkContant;

					//cal max 
					var tmpSupplierMax = _data.supplier[key].disk+_data.supplier[key].network;
					if(that.supplierMax < tmpSupplierMax)
						that.supplierMax = tmpSupplierMax;

					if(typeof _data.supplier[parseInt(key)+1] == "undefined")
						supplierFlag = true;			
				}
			}
			else
				supplierFlag = true;		

			if(_data.client.length > 0)
			{
				//client 換算成錢 & 加總
				for(var key in _data.client)
				{
					var tmpDisk = parseInt(_data.client[key].disk),
						tmpNetork = parseInt(_data.client[key].network);

					//cal money
					var tmpClientDisk = tmpDisk;
					var tmpClientNetwork = tmpNetork;

					_data.client[key].disk = tmpClientDisk*diskContant;
					_data.client[key].network = tmpClientNetwork*networkContant;

					//cal max 
					var tmpClientMax = _data.client[key].disk+_data.client[key].network;
					if(that.clientMax < tmpClientMax)
						that.clientMax = tmpClientMax;

					if(typeof _data.client[parseInt(key)+1] == "undefined")
						clientFlag  = true;
				}
			}
			else
				clientFlag  = true;
			

			if(clientFlag && supplierFlag)
				_callback();

		},

		addIncomeDetail = function(_clientData,_max)
		{	
			var that = this;
			var todo = 1,
				finish = function() 
				{ 
					if(--todo == 0) 
					{
						sort(that.childrenClient,"name",function(_data)
						{
							for(var key in that.childrenClient) 
							{
								_data[key].node.appendTo($("div.income div.detail", that.node));
							}

						});
					} 
				}
		   
		    for(var key in _clientData)
		    {
		    	todo ++;
		    	var tmpWidget = 
				{
			       	"name": "analyzeDetail",
			    	"data": 
			    	{
			    		"data":_clientData[key],
			    		"max":_max
			    	}
			    }

		    	elucia.addTo(tmpWidget, $("div.income div.detail", this.node), function(_node, _data, _obj) 
				{
					that.childrenClient.push(_obj);
					finish();
				});
		    }	
		    finish();
		},

		addPaymentDetail = function(_supplierData,_max)
		{
		    var that = this;
		    var todo = 1,
				finish = function() 
				{ 
					if(--todo == 0) 
					{
						var keepGo = true;
						
						sort(that.childrenSupplier,"name",function(_data)
						{
							for(var key in that.childrenSupplier) 
							{
								_data[key].node.appendTo($("div.payment div.detail", that.node));
							}

						});
					} 
				}

		    for(var key in _supplierData)
		    {
		    	todo ++;
		    	var tmpWidget = 
				{
			       	"name": "analyzeDetail",
			    	"data": 
			    	{
			    		"data":_supplierData[key],
			    		"max":_max
			    	}
			    }

				elucia.addTo(tmpWidget, $("div.payment div.detail", this.node), function(_node, _data, _obj) 
				{
					that.childrenSupplier.push(_obj);
					finish();
				});
			}
			finish();
		},

		sort = function(_data,_item,_callback)
		{
			var keepGo = true,
				item,
				item2,
				check = false;

			switch(_item)
			{
				case "name": 
					item = "name";
					check = true;				
					break;
				case "disk":
					item = "disk";	
					check = true;
					break;
				case "network":
					item = "network";
					check = true;
					break;
				case "total":
					item = "disk";	
					item2 = "network";
					check = true;
					break;
			}

			if(check)
			{
				for(var key=0; key<_data.length; key++)
	            {
	            	keepGo = false;
	            	for(var key2=(key+1); key2<_data.length; key2++)
	        		{
	        			if(item2 != "network")
	        			{
	        				if(_data[key].data[item] > _data[key2].data[item])
			            	{	
			            		keepGo = true;
			            		var t =  _data[key];
			            		_data[key] = _data[key2];
			            		_data[key2] = t;
			            	}
	        			}
	        			else if(item2 == "network")
	        			{
	        				keyTotal = _data[key].data[item]+_data[key].data[item2];
		        			key2Total = _data[key2].data[item]+_data[key2].data[item2];
		        			if(keyTotal > key2Total)
			            	{	
			            		keepGo = true;
			            		var t =  _data[key];
			            		_data[key] = _data[key2];
			            		_data[key2] = t;
			            	}
	        			}
	            	}					            			            	
	            }
			}			

            if(!keepGo)
         		_callback(_data);
		},

		//費率刻度
		msgBox = function(_this)
		{
			var el, newPoint, newPlace, offset;

			// Cache this for efficiency
		    el = $(_this);
	
		    // Measure width of range input
		    width = el.width();

		    // Figure out placement percentage between left and right of input
		    newPoint = (el.val() - el.attr("min")) / (el.attr("max") - el.attr("min"));
		   
		    // Janky value to get pointer to line up better
		    offset = -1.3;
		   
		    // Prevent bubble from going beyond left or right (unsupported browsers)
		    if (newPoint < 0) { newPlace = 0; }
		    else if (newPoint > 1) { newPlace = width; }
		    else { newPlace = width * newPoint + offset; offset -= newPoint; }
		 
		    // Move bubble
		   	el.next("output").text(el.val()).css("left",el.width()*1.6);
		    // el.next("output").css(
		    // {
		    //     left: newPlace,
		    //     marginLeft: offset + "%"
		    // }).text(el.val());
		},

		destroy = function() 
		{
			for(var key in this.childrenSupplier)
			{
				this.childrenSupplier[key].destroy();
			}

			for(var key in this.childrenClient)
			{
				this.childrenClient[key].destroy();
			}
		},

		that = 
		{
			init: init,
			tagClick:tagClick,
			rangeChange:rangeChange,
			draw:draw,
			resetContent:resetContent,
			getData:getData,
			msgBox:msgBox,
			calc:calc,
			addIncomeDetail: addIncomeDetail,
			addPaymentDetail:addPaymentDetail,
			destroy: destroy
		};

		return that;
	}

	return Analyze;
});