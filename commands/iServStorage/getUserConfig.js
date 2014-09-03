module.exports = function() {
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	},
 
	execute = function(_data, _callback)
	{
		try 
		{
			var role = _data.user.role,
				apps = [
					[
						{"title": "System Monitor", "icon": "system.monitor.png", "group": "center", "widget": "supplierMonitor"},
						{"title": "Node Risk", "icon": "node.risk.png", "group": "center", "widget": "nodeRisk"},
						{"title": "File Healthy", "icon": "file.healthy.png", "group": "center", "widget": "fileHealthy"},
						{"title": "Billing", "icon": "billing.png", "group": "center", "widget": "analyze"},
						{"title": "Config", "icon": "config.png", "group": "center", "widget": "sysConfig"}
					],
					[
						{"title": "File Browser", "icon": "file.browser.png", "group": "user", "widget": "browser"},
						{"title": "Usage Analysis", "icon": "usage.analysis.png", "group": "user", "widget": "usageAnalyze"},
						{"title": "Node Monitor", "icon": "node.monitor.png", "group": "supplier", "widget": "supplier"},
						{"title": "Config", "icon": "config.png", "group": "supplier", "widget": "sysSupplierCof"}
					]
				];

			_data._result.result = 1;
			_data._result.data = {
				"username": _data.user.username,
				"role": role,
				"apps": apps[role]
			};

			_callback(false, job);
		}
		catch(e) 
		{
			_callback(e);
		}

	},

	that = {
		init: init,
		execute: execute
	};
	return that;
}