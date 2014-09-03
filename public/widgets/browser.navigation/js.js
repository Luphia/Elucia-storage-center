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

      $("div#path").text(_data);

			return this;
		},

		getData = function( path ) {
      return 0;
		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			destroy: destroy
		};

		return that;
	};

	return Application;
});