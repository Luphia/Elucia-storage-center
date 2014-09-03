define(function() {
	var Application = function() {
/*
	this.data
	this.node
*/
		var node,
			data,

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;
			this.apps = [];

			this.getData();
			var currLogout = $.proxy(this.data.user, "logout"),
				currDestroy = $.proxy(this, "destroy");

			$("div.system > div:nth-child(1)", this.node).click(function() {
				currLogout && currLogout();
				currDestroy && currDestroy();
				$("body").css("background", "");
			});

			return this;
		},

		getData = function() {
			var path = "/user/config";
				currUpdate = $.proxy(this, "updateData");

			elucia.rest.get({
				url: path,
				success: currUpdate
			});
		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
			if(_data.data.role == 0) {
				$("div.title", this.node).text("iServStorage Center");
				$("body").css("background", "url(../images/pattern.png) #975");
			}
			else if(_data.data.role == 1) {
				$("div.title", this.node).text("Client Management");
				$("body").css("background", "url(../images/pattern.png) #579");
			}



			for(var key in _data.data.apps) {
				this.addIcon(_data.data.apps[key]);
			}
		},

		addIcon = function(_data) {
			var tmpWidget = {
					"name": "desktop.icon",
					"data": _data
				},
				that = this;

			elucia.addTo(tmpWidget, $("div.apps", this.node), function(_node, _data, _obj) { 
				that.apps.push(_obj);
			});
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
			for(var key in this.apps) {
				this.apps[key].destroy();
			}
			this.node.remove();
		},

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			addIcon: addIcon,
			destroy: destroy
		};

		return that;
	};

	return Application;
});