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
			this.status = true;

			_data && (this.status = _data.status);
			if(this.status) {
				this.node.addClass("on");
			}
			else {
				this.node.addClass("off");
			}

			var currToggle = $.proxy(this, "toggle");
			this.node.click(currToggle);

			return this;
		},

		toggle = function() {
			this.status = !this.status;
			if(this.status) {
				this.on();
			}
			else {
				this.off();
			}

			this.data.toggle && this.data.toggle();
		},

		on = function() {
			this.status = true;
			this.node.removeClass("off").addClass("on");
			this.data.on && this.data.on();
		},

		off = function() {
			this.status = false;
			this.node.removeClass("on").addClass("off");
			this.data.off && this.data.off();
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
		},

		that = {
			init: init,
			toggle: toggle,
			on: on,
			off: off,
			destroy: destroy
		};

		return that;
	};

	return Application;
});