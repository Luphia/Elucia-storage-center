define(function()
{
	var sysConfig = function()
	{
		var node,
			data,

		init = function(_node, _data)
		{
			this.node = _node;
			this.data = _data;
			this.children = [];

			this.addContent();

			$("div.submit",this.node).click(function()
			{
				saveData();
			});

			return this;
		},

		addContent = function()
		{
			var that = this;
			elucia.rest.get(
			{
				url: "/configInfo/infoGet",
				success: function(_data) 
				{
					if(_data.result == 1)
					{
						that.addFile(_data.data.fileRepairPeriod,_data.data.fileStrategy);
						that.addPerson(_data.data.expireTime);
						that.addSys(_data.data.supplierMonitorPeriod);
					}
				}
			});
		},

		addFile = function(_fileRepairPeriod,_fileStrategy)
		{
			var tmpWidget = 
			{
		       	"name": "sysConfigFile",
		    	"data": {
		    		"fileRepairPeriod" : _fileRepairPeriod,
		    		"fileStrategy" : _fileStrategy
		    	}
		    },

		    that = this;
			elucia.addTo(tmpWidget, $("div.file > div.content", this.node), function(_node, _data, _obj) 
			{
				that.children.push(_obj);
			});
		},

		addPerson = function(_expireTime)
		{
			var tmpWidget = 
			{
		       	"name": "sysConfigPerson",
		    	"data": {
		    		"expireTime":_expireTime
		    	}
		    },

		    that = this;
			elucia.addTo(tmpWidget, $("div.person > div.content", this.node), function(_node, _data, _obj) 
			{
				that.children.push(_obj);
			});
		},

		addSys = function(_supplierMonitorPeriod)
		{
			var tmpWidget = 
			{
		       	"name": "sysConfigSys",
		    	"data": {
		    		"supplierMonitorPeriod":_supplierMonitorPeriod
		    	}
		    },

		    that = this;
			elucia.addTo(tmpWidget, $("div.sys > div.content", this.node), function(_node, _data, _obj) 
			{
				that.children.push(_obj);
			});
		},

		saveData = function()
		{
			var tokenTime = parseInt($("input[name=tokenTimeH]",this.node).val())*3600+parseInt($("input[name=tokenTimeI]",this.node).val())*60+parseInt($("input[name=tokenTimeS]",this.node).val());
			var sysMonitorPeriod = parseInt($("input[name=sysMonitorPeriodI]",this.node).val())*60+parseInt($("input[name=sysMonitorPeriodS]",this.node).val());
			var fileRepair = parseInt($("input[name=fileRepairI]",this.node).val())*60+parseInt($("input[name=fileRepairS]",this.node).val());
			
			if(isNaN(tokenTime))
			{
				alert("請輸入token到期時間");
				return false;
			}
			else if(isNaN(sysMonitorPeriod))
			{
				alert("請輸入節點監控間隔");
				return false;
			}
			else if(isNaN(fileRepair))
			{
				alert("請輸入檔案修復間隔");
				return false;
			}

			elucia.rest.post(
			{	
				url: "/configInfo/infoSave",
        	    'Authorization': 'Bearer ' + configuration.user.token,
        	    'data':
        	    {
        	    	'tokenTime':tokenTime,
        	    	'fileRepair':fileRepair*1000,
        	    	'fileReplication':parseInt($("input[name=fileReplication]",that.node).val()),
        	    	'sysMonitorPeriod':sysMonitorPeriod*1000
        	    },
				success: function(_data) 
				{
					if(_data.result == 1)
					{
						alert("modify success");
					}
					else
					{
						alert("modify error");
					}
				}
			});		
		},

		destroy = function() 
		{
			for(var key in this.children)
				 this.children.destroy();

			this.children = [];
		},

		that = 
		{
			init: init,
			saveData:saveData,
			addContent:addContent,
			addPerson:addPerson,
			addFile:addFile,
			addSys:addSys,
			destroy: destroy
		};

		return that;
	}

	return sysConfig;
});