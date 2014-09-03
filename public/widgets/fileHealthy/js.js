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
			this.toggle = true;
			this.nodes = [];
			this.interval = [];
			!this.data && (this.data = {});
			this.data.files = {
				"total": 0,
				"bad": 0,
				"lost": 0,
				"good": 0
			};

			this.getData();

			var currToggle = $.proxy(this, "toggleTest");
			var currOn = $.proxy(this, "startTest");
			var currOff = $.proxy(this, "stopTest");

			var tmpWidget = {
				"name": "switch",
				"data": {
					"status": false,
					"on": currOn,
					"off": currOff
				}
			};

			elucia.addTo(tmpWidget, $("div.config > div:nth-child(1) > div.controll", this.node), function(_node, _data, _obj) {

			});

			var currRepair = $.proxy(this, "testRepair");
			this.repairInterval = setInterval(currRepair, 100);

			return this;
		},

		test = function() {
			var currUpload = $.proxy(this, "testUpload");
			currUpload();

			for(var key in this.nodes) {
				if(this.nodes[key].status()) {
					(Math.random() < 0.001) && (this.nodes[key].switch.off());
				}
				else {
					(Math.random() < 0.01) && (this.nodes[key].switch.on());
				}
			}
		},

		testUpload = function() {
			if(this.data.files.total >= 3000) {
				var clean = $("div.datas > div.data:not(.alert):nth-child(2n)");
				var toDelete = parseInt(clean.length / 2);
				this.data.files.total -= toDelete;
				clean.remove();

				return false;
			}

			var users = $("div.user:not(.offline)");
			var nodes = $("div.node:not(.offline)");
			var selectNode = Math.floor(Math.random() * nodes.length);

			var from = users[ Math.floor(Math.random() * users.length) ];
			var to = nodes[ selectNode ];

			var node = $('<div class="data animate"></div>').appendTo("div.fileHealthy");
			var position = $(from).offset();
			var toDatas = $("div.datas", to);
			var newData = $("<div></div>").addClass("data").addClass("transfer").appendTo(toDatas);
			var target = newData.offset();
			target.top = target.top - 30;
			target.left = target.left;


			node.offset(position);
			var that = this;
			var currDup = $.proxy(this, "testDuplicate");
			var currSummary = $.proxy(this, "summary");
			var dupNum = 1;

			node.animate(target, 5000, function() {
				newData.removeClass("transfer");
				$(this).remove();

				if(nodes.length < (1 + dupNum)) {
					newData.addClass("alert");
					newData.prependTo(toDatas);
					return false;
				}

				for(var i=0; i<1; i++) {
					var dupNode = selectNode;
					while(dupNode == selectNode) {
						dupNode = Math.floor(Math.random() * nodes.length);
					}
					
					currDup(newData, nodes[dupNode]);
					that.data.files.total++;
					currSummary();
				}
			});
		},

		testRepair = function() {
			for(var key in this.nodes) {
				this.nodes[key].testRepair();
			}

			this.summary();
			// if($("div.node:not(.offline) div.data.alert", this.node).length == 0 ||  $("div.node:not(.offline)").length < 2) { return false; }

			// var nodes = $("div.node:not(.offline)");
			// var selectNode = Math.floor(Math.random() * nodes.length);
			// var dupNode;

			// while(typeof(dupNode)=="undefined" || dupNode == selectNode) {
			// 	dupNode = Math.floor(Math.random() * nodes.length);
			// }

			// var users = $(nodes[selectNode]);
			// var to = $(nodes[dupNode]);

			// var toRepairs = $("div.data.alert", users);
			// if(toRepairs.length == 0) { return false; }

			// var toRepair = $(toRepairs[toRepairs.length-1]);
			// toRepair.removeClass("alert").addClass("repair");

			// var node = $('<div class="data animate"></div>').appendTo("div.fileHealthy");
			// var position = $(toRepair).offset();
			// var toDatas = $("div.datas", to);
			// var newData = $("<div></div>").addClass("data").addClass("transfer").appendTo(toDatas);
			// var target = newData.offset();
			// target.top = target.top - 50;
			// target.left = target.left - 20;

			// node.offset(position);
			// node.animate(target, 3000, function() {
			// 	newData.removeClass("transfer");
			// 	toRepair.removeClass("repair");
			// 	$(this).remove();
			// });

			// this.summary();
		},

		testDuplicate = function(a, b) {
			var users = $(a);
			var nodes = $(b);
			var selectNode = Math.floor(Math.random() * nodes.length);

			var from = users[ Math.floor(Math.random() * users.length) ];
			var to = nodes[ selectNode ];

			var node = $('<div class="data animate"></div>').appendTo("div.fileHealthy");
			var position = $(from).offset();
			var toDatas = $("div.datas", to);
			var newData = $("<div></div>").addClass("data").addClass("transfer").appendTo(toDatas);
			var target = newData.offset();
			target.top = target.top - 30;
			target.left = target.left;

			node.offset(position);
			node.animate(target, 2000, function() {
				newData.removeClass("transfer");
				$(this).remove();
			});
		},
		testOn = function() {
			this.summary();
		},
		testOff = function(_num) {
			var currBad = $.proxy(this, "testBadFile");
			currBad(_num);
			this.summary();
		},
		testBad = function() {
			// bad nodes
			var isBad = $("div.node.offline", this.node).length
			var totalNode = $("div.node", this.node).length;
			var totalBadNode = Math.floor(Math.random() * (totalNode - 4)) + 1;

			for(var key in this.nodes) {
				var power = (Math.random() >= 0.5);
				if(isBad < totalBadNode && !power) {
					this.nodes[key].switch.off();
					isBad++;
				}
			}
		},

		testBadFile = function(_num) {

			var totalbad = 0;
			var nodes = this.getOnlineNode();

			var limit = _num * 3;
			while(_num > totalbad && --limit > 0) {
				toBad = 1;

				var selectNode = Math.floor(Math.random() * nodes.length);
				var goodFile = $("div.data:not(.alert)", nodes[selectNode].node);
				if(goodFile.length > 0) {
					$(goodFile[0]).addClass("alert");
					totalbad++;
				}
				else {
					
				}
			}
		},

		summary = function() {
			if($("div.node", this.node).length > 0) {
				this.data.files.bad = $("div.node:not(.offline) div.data.alert", this.node).length;
			}
			var total = this.data.files.total,
				lost = this.data.files.lost + $("div.node.offline div.data.alert", this.node).length;

			var complete = parseInt((total - lost) / this.data.files.total * 100);
			var healthy = parseInt((total - lost - this.data.files.bad) / (total - lost) * 100);

			$("div.summary > div.block:nth-child(1) div.value", this.node).text(total);
			$("div.summary > div.block:nth-child(2) div.value", this.node).text(complete + "%");
			$("div.summary > div.block:nth-child(2) div.unit", this.node).text(lost + " files are lost");
			$("div.summary > div.block:nth-child(3) div.value", this.node).text(healthy + "%");
			$("div.summary > div.block:nth-child(3) div.unit", this.node).text(this.data.files.bad + " files are unhealthy");
		},

		getData = function() {
			var path = "/nodeRisk",
				that = this,
				currUpdate = $.proxy(this, "updateData"),
				currAddNode = $.proxy(this, "addNode"),
				currSummary = $.proxy(this, "summary");

			elucia.rest.get({
				url: path,
				success: function(_data) {
					for(var key in _data.data.node) {
						var nodeData = _data.data.node[key];

						currAddNode(nodeData);
					}

					that.data.files.total = _data.data.summary[""].total;
					that.data.files.bad = _data.data.summary[""].risk;
					that.data.files.lost = _data.data.summary[""].losed;
					that.data.files.good = that.data.files.total - that.data.files.bad - that.data.files.lost;

					currSummary();
				}
			});

			/*
			var randomC = parseInt(Math.random() * 6);
			var count = 4 + randomC;
			var maxDown = parseInt(Math.random() * 0.5 * (count-2)) + 1;
			var totallost = 0; //parseInt(Math.random() * 100);
			var totalbad = 0;
			var totalgood = 0;
			var down = 0;

			for(var i=0; i<count; i++) {
				var no = parseInt(Math.random() * 100);
				var bad = parseInt(Math.random() * 100);
				var good = parseInt(Math.random() * 100) * 2 + 200;
				var status = 1;

				// totalbad += bad;
				totalgood += good / 2;

				var tmpdata = {
					"no": i + 1,
					"status": status,
					"fileCount": good,
					"good": good,
					"bad": 0
				};

				this.addNode(tmpdata);
			}

			this.data.files = {
				"total": totalbad + totalgood + totallost,
				"bad": totalbad,
				"lost": totallost,
				"good": totalgood
			};

			var currTB = $.proxy(this, "testBad");
			var currSM = $.proxy(this, "summary");
			setTimeout(function() {
				currTB();
				currSM();
			}, 500);
			*/
		},

		getEvent = function() {

		},

		getOnlineNode = function(i) {
			var rtdata = [];
			for(var key in this.nodes) {
				this.nodes[key].status() && i != key && rtdata.push(this.nodes[key]);
			}

			return rtdata;
		},

		getOfflineNode = function(i) {
			var rtdata = [];
			for(var key in this.nodes) {
				!this.nodes.status() && i != key &&  rtdata.push(this.nodes[key]);
			}

			return rtdata;
		},

		updateData = function(_data) {
			elucia.debug("### appliaction.updateData ###");
		},

		addNode = function(_data) {
			var that = this;
			_data.on = $.proxy(this, "testOn");
			_data.off = $.proxy(this, "testOff");
			_data.getOnline = $.proxy(this, "getOnlineNode");

			var tmpWidget = {
				"name": "fileHealthy.node",
				"data": _data
			};
			elucia.addTo(tmpWidget, $("div.cloud", this.node), function(_node, _data, _obj) {
				_obj.number = (that.nodes.push(_obj)) - 1;
			});
		},

		toggleTest = function() {
			console.log("toggle");
			if(this.toggle) {
				this.startTest();
			}
			else {
				this.stopTest();
			}

			this.toggle = !this.toggle;
		},
		startTest = function() {
			this.stopTest();

			var currTest = $.proxy(this, "test");
			for(var i=0; i<3; i++) {
				this.interval.push( setInterval(currTest, Math.random()*500 + 500) );
			}
		},
		stopTest = function() {
			for(var key in this.interval) {
				clearInterval(this.interval[key]);
			}

			this.interval.splice(0);
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
			for(var key in this.interval) {
				clearInterval(this.interval[key]);
			}

			delete this;
		},

		that = {
			init: init,
			summary: summary,
			getData: getData,
			getEvent: getEvent,
			getOnlineNode: getOnlineNode,
			getOfflineNode: getOfflineNode,
			updateData: updateData,
			addNode: addNode,
			test: test,
			testUpload: testUpload,
			testDuplicate: testDuplicate,
			testRepair: testRepair,
			testOn: testOn,
			testOff: testOff,
			testBad: testBad,
			testBadFile: testBadFile,
			toggleTest: toggleTest,
			startTest: startTest,
			stopTest: stopTest,
			destroy: destroy
		};

		return that;
	};

	return Application;
});