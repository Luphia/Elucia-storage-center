define(function() {
	var Confirm = function() {
		var init = function(_node, _data) {
			_callback = _data["callback"];

			$(_node).click(function() { return false; });
			$("div.confirmMsg", _node).text(_data["message"]);
			$("button:nth-child(1)", _node).text("ok");
			$("button:nth-child(2)", _node).text("cancel");

			if(typeof(_callback) == "function") {
				$("button:nth-child(1)", _node).hammer().on("tap", function() {
					_callback(_data);
					_node.remove();
					return false;
				});
				$("button:nth-child(2)", _node).hammer().on("tap", function() {
					_node.remove();
					return false;
				});
			}
			else if(_callback && typeof(_callback.ok) == "function") {
				$("button:nth-child(1)", _node).hammer().on("tap", function() {
					_callback.ok(_data);
					_node.remove();
					return false;
				});
				$("button:nth-child(2)", _node).hammer().on("tap", function() {
					_callback.cancel(_data);
					_node.remove();
					return false;
				});
			} else {
				$("button:nth-child(1)", _node).hammer().on("tap", function() {
					_node.remove();
					return false;
				});

				$("button:nth-child(2)", _node).remove();
			}
			return this;
		},

		that = {
			init: init
		};

		return that;
	};

	return Confirm;
});