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

			var currExecute = $.proxy(this, "execute");
			this.node.click(currExecute);
			$("div.title", this.node).text(this.data.title).trunk8();
			var tmpbg = $(this.node).css("background");

			return this;
		},

		execute = function() {
			confirm(this.data.title);
		},

		getData = function() {

		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			execute: execute,
			getData: getData,
			updateData: updateData,
			destroy: destroy
		};

		return that;
	};

	return Application;
});