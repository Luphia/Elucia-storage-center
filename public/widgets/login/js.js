define(function() {

	var Login = function() {
		var init = function(_node, _data) {
			this.data = _data;

			var currLogin = $.proxy(this, "login");
			$("#login", _node).click( function() {
				var data = {
					"username": $("input.user", _node).val(),
					"password": $("input.password", _node).val()
				};
				currLogin(data);
			});
		
			_node.keydown( function(event) {
				if(event.keyCode == 13) {
					var account = $("input.user", _node).val();
					var password = $("input.password", _node).val();
					
					if(account.trim() == "") {
						$("input.user", _node).focus();
					} else if(password.trim() == "") {
						$("input.password", _node).focus();
					} else {			
						$("button#login", _node).click();
					}
				}
			});

			$("input.user", _node).focus();
			this.checkLogin();
			return this;
		},
		login = function(_data) {
			var that = this;
			$("div.login input", this.node).attr("disabled", "disabled");
			$("div.login button", this.node).attr("disabled", "disabled");
			$("div.login span.message", this.node).removeClass("alert").text("checking...");

			var data = {
				url: this.data.config.paths.login,
				data: _data,
				success: function(_data) {
					if(_data.result == 1) {
						that.hide();
						$("input.password", this.node).val("");
						that.data.afterLogin(_data.data);
					}
					else {
						that.alert(_data.message);
						$("input.password", that.node).focus();
					}

					$("div.login input", this.node).removeAttr("disabled");
					$("div.login button", this.node).removeAttr("disabled");
				}
			};
			elucia.rest.post(data);
		},
		logout = function() {
			var that = this;
			var data = {
				url: this.data.config.paths.login,
				data: {},
				success: function(_data) {
					that.show();
					that.data.afterLogout();
				}
			};

			elucia.rest.del(data);
		},
		checkLogin = function() {
			var that = this;
			var data = {
				url: this.data.config.paths.login,
				success: function(_data) {
					if(_data.result == 1) {
						that.hide();
						that.data.afterLogin(_data.data);
					}
				}
			};

			elucia.rest.get(data);
		},
		show = function() {
			$("div.login", this.node).animate({"margin-top": "-100"}, 300);
		},
		hide = function() {
			$("div.login", this.node).animate({"margin-top": "-100%"}, 300);
		},
		alert = function(_data) {
			$("div.login span.message", this.node).addClass("alert").text(_data);
			$("div.login", this.node).animate({"margin-left": "-=10"}, 100, function() {
				$("div.login", this.node).animate({"margin-left": "+=20"}, 100, function() {
					$("div.login", this.node).animate({"margin-left": "-=20"}, 100, function() {
						$("div.login", this.node).animate({"margin-left": "+=20"}, 100, function() {
							$("div.login", this.node).animate({"margin-left": "-=20"}, 100, function() {
								$("div.login", this.node).animate({"margin-left": "+=10"}, 100);
							})
						})
					})
				})
			});
		},
		destroy = function() {

		},

		that = {
			init: init,
			login: login,
			logout: logout,
			checkLogin: checkLogin,
			hide: hide,
			show: show,
			alert: alert,
			destroy: destroy
		};

		return that;
	};

	return Login;
});