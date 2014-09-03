define(function() {
	/*
		this.data - 保存資料(不喜歡用 model 時採用)
		this.model - 內部資料模組(含 fetch 功能)
		this.el - 此 widget 的 jQuery 物件
		this.template - 此 widget 預設 template

		init - widget 初始化時呼叫
		# getData - widget 取得初始化資料
		# updateData - widget 取得初始化資料
		# render - widget 資料更新時呼叫，用以更新顯示畫面
		# destroy - widget 被關閉時呼叫
	*/

	var Basic = Spine.Controller.sub({
		proxied: ["render", "updateData"],
		init: function(_data) {
			var cModel = this.model;
			elucia.loadTemplate(_data.name, this);
			this.model.fetch();
		},
{"click div.button": "getData"},
{"change input.data": "update"},
		getData: function(_data) {

		},

		updateData: function(_data) {

		},

		render: function(_data) {
			console.log("render: " + JSON.stringify(_data));
			var newNode = this.template.tmpl(_data);
			this.el.append(newNode);
      		return this;
		},

		destroy : function() {

		}
	});

	return Basic;
});