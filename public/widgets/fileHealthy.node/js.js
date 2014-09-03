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
			var bad = this.data.risk,
				good = this.data.fileCount - bad;

			$("div.icon", this.node).text(this.data.ip);
			if(this.data.status < 1) {
				this.node.addClass("offline");
			}

			for(var i=0; i<bad; i++) {
				var data = $('<div></div>').addClass("data").addClass("alert");
				$("div.datas", this.node).append(data);
			}

			for(var i=0; i<good; i++) {
				var data = $('<div></div>').addClass("data");
				$("div.datas", this.node).append(data);
			}

			var tmpWidget = {
				"name": "switch",
				"data": {
					"status": (this.data.status == 1),
					"on": $.proxy(this, "on"),
					"off": $.proxy(this, "off")
				}
			};

			var that = this;
			elucia.addTo(tmpWidget, $("div.icon", this.node), function(_node, _data, _obj) {
				that.switch = _obj;
			});

			return this;
		},

		getData = function(_id) {
			var path = "/app/" + _id,
				currUpdate = $.proxy(this, "updateData");

			elucia.rest.get({
				url: path,
				success: currUpdate
			});
		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		testRepair = function() {
			// this node is not work
			if(this.data.status != 1) { return false; }

			var nodes = this.data.getOnline(this.number);

			// there is no backup node
			if(nodes.length == 0) { return false; }

			var dupNode = Math.floor(Math.random() * nodes.length);

			var users = this.node;
			var to = nodes[dupNode].node;

			var toRepairs = $("div.data.alert", users);

			// no need to repair
			if(toRepairs.length == 0) { return false; }

			var toRepair = $(toRepairs[toRepairs.length-1]);
			toRepair.removeClass("alert").addClass("repair");

			var node = $('<div class="data animate"></div>').appendTo("div.fileHealthy");
			var position = $(toRepair).offset();
			var toDatas = $("div.datas", to);
			var newData = $("<div></div>").addClass("data").addClass("transfer").appendTo(toDatas);
			var target = newData.offset();
			target.top = target.top - 30;
			target.left = target.left;

			node.offset(position);
			node.animate(target, 3000, function() {
				newData.removeClass("transfer");
				toRepair.removeClass("repair");
				$(this).remove();
			});

		},

		status = function() {
			return (this.data.status == 1);
		},
		on = function() {
			this.data.status = 1;
			this.node.removeClass("offline");
		},
		off = function() {
			this.data.status = 0;
			this.node.addClass("offline");
			this.data.off($("div.data:not(.alert)", this.node).length);

			// 捨棄非風險資料
			$("div.data:not(.alert)", this.node).remove();
		},

		destroy = function() {
			this.data.status = 0;
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			testRepair: testRepair,
			status: status,
			on: on,
			off: off,
			destroy: destroy
		};

		return that;
	};

	return Application;
});