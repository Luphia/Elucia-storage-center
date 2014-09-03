define(function() {
	var Msg = function() {
		var node,
			period = 5000,

		init = function(_node, _data) {
			if(typeof(_data) != "undefined") {
				if(typeof(_data.container) != "undefined") {}
				if(typeof(_data.keep) != "undefined") {}
				if(typeof(_data.container) != "undefined") {}
			}

			node = _node;

			return this;
		},

		alert = function(_data) {
			var myMsg;
			if(typeof(_data) == "object") {
				myMsg = JSON.stringify(_data);
			}
			else {
				myMsg = i18n._(_data);
			}

			var tmpmsg = $('<div class="message"></message>'),
			pointer = $('<div class="pointer"></div>'),
			body = $('<div class="body"></div>').text(myMsg);
			tmpmsg.append(pointer).append(body).appendTo(node);

			setInterval(function() {
				tmpmsg.slideUp(300, function() {
					tmpmsg.remove();
				});

			}, period);
		},

		that = {
			init: init,
			alert: alert
		};

		return that;
	};

	return Msg;
});