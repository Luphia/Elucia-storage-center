define(function() {
	var Window = function() {
		var node,
			data,
			widget,

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;

			this.node.animate({top: 0, left: 0}, 100);
			var os = window.$.client.os;

			// drag event

			if(os == "Windows" || os == "Mac") {
				this.node.pep({
					stop: function(ev, obj) {
						if(!obj.startPosition) { return false; }
					
						var stopPosition = obj.$el.offset();
						var movedTop = Math.abs(stopPosition.top - obj.startPosition.top) < 5;
						var movedLeft = Math.abs(stopPosition.left - obj.startPosition.left) < 5;

						if ( movedTop && movedLeft ) {
							console.log(ev.target);
							// $(ev.target).click();
							$(ev.target).focus();
						}
					}

					, start: function(ev, obj){
						obj.startPosition = obj.$el.offset();
						elucia.windowToTop(_node);
					}

					, constrainToParent: false
				});
				_node.css("zIndex", "");

				/*
				$("div.content", this.node).click(function() {
					$.pep.toggleAll(false);
					$("body").one('click', function() {
						$.pep.toggleAll(true);
					});
					return false;
				});
				*/
				
			} else {
				this.node.hammer().on("drag", "div.header", function(event) {
					//console.log(event);
					window.getSelection().removeAllRanges();
					event.gesture.preventDefault();

					var target = event.target,
						touches = event.gesture.touches,
						dx = $(this).parent().width() / 2,
						dy = $(this).height() / 2;

					$(this).parent().css({
						left: event.gesture.touches[0].pageX - dx,
						top: event.gesture.touches[0].pageY - dy
					});

				});
			}



			this.node.hammer().on("tap", function(event) {
				elucia.windowToTop(_node);
			});

			var closeMe = $.proxy(this, "destroy");
			$(".operate .close", this.node).click(closeMe);

			var maxMe = $.proxy(this, "toggleMax");
			$(".operate .max", this.node).click(maxMe);

			var minMe = $.proxy(this, "toggleMin");
			$(".operate .min", this.node).click(minMe);

			return false;
		},

		toggleMax = function() {
			this.node.removeClass("min");
			this.node.toggleClass("max");
		},

		toggleMin = function() {
			this.node.removeClass("max");
			this.node.toggleClass("min");
		},

		destroy = function() {
			console.log(this);

			if(widget) {
				try {
					widget.destroy();
				} catch(e) {
					console.log("[widget " + widget.name + "] do not have destroy function");
				}
			}

			this.node.remove();
		},

		setTitle = function(_title) {
			$("div.title", this.node).text(_title);
		},

		loadWidget = function(_widget) {
			elucia.addTo(_widget, $("div.content", this.node), function(_node, _data, _obj) {
				widget = _obj;
			});
		},

		that = {
			init: init,
			destroy: destroy,
			toggleMax: toggleMax,
			toggleMin: toggleMin,
			setTitle: setTitle,
			loadWidget: loadWidget,
			node: node
		};

		return that;
	};

	return Window;
});