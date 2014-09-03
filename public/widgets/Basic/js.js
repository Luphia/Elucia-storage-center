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

			var tmpWidget = {
				"name": "myWidget",
				"data": []
			};
			elucia.addTo(tmpWidget, $("div.block:nth-child(1) div.content", this.node), function(_node, _data, _obj) { myBlock.cpu = _obj; });

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

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
		},

		aaa = function() {}

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			destroy: destroy,
			aaa:aaa
		};

		return that;
	};

	return Application;
});