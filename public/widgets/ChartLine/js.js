define(function() {
	var ChartLine = function() {
		var node,
			data,
			config,
			defaultConfig = {
				color: [
					{"stroke": "#0088FF", "area": "rgba(50, 180, 255, 0.5)"},
					{"stroke": "#55CC66", "area": "rgba(120, 255, 120, 0.4)"}
				],
				size: {
					width: 190,
					height: 90
				},
				unit: {
					x: 1,
					y: 1
				},
				dataSize: 30,
				maxValue: 100,
				maxLock: false,
				random: false
			},

		init = function(_node, _data) {
			// elucia.debug("### ChartLine.init ###");
			this.node = _node;
			this.data = new Array();
			this.point = new Array();
			this.lineLayer = _node.find("canvas.line-layer");
			this.areaLayer = _node.find("canvas.area-layer");
			this.axisLayer = _node.find("canvas.axis-layer");
			this.initConfig(_data.config);
			this.initData(_data.data);

			// _node.find("canvas").width(this.config.size.width);
			// _node.find("canvas").height(this.config.size.height);
			myConfig = this.config;

			_node.find("canvas").each(function() {
				this.width = myConfig.size.width;
				this.height = myConfig.size.height;
			});

			this.draw();

			return this;
		},

		initConfig = function(_data) {
			// elucia.debug("### ChartLine.initConfig ###");
			if(typeof(_data) == "undefined") {
				_data = {};
			}

			this.config = defaultConfig;
			for(var key in _data) {
				this.config[key] = _data[key];
			}
		},

		initData = function(_data) {
			// elucia.debug("### ChartLine.initData ###");
			if(typeof(_data) == "undefined") {
				_data = [];
			}
			if(!elucia.isArray(_data[0])) {
				_data = [_data];
			}

			for(var i = 0; i < _data.length; i++) {
				this.data[i] = new Array(this.config.dataSize);
				for(var j = 0; j < this.config.dataSize; j++) {
					this.data[i][j] = 0;
				}
			}

			if(this.config.random) {
				_data = this.random(_data);
			}
			this.updateData(_data);
		},

		random = function(_data) {
			var result = [];
			for(var key in _data) {
				if(_data[key].length == 0) {
					var tmpData = new Array(this.config.dataSize);
					for(var i = 0; i < tmpData.length; i++) {
						tmpData[i] = Math.random() * Math.random() * this.config.maxValue;
					}
					result[key] = tmpData;
				}
			}
			return result;
		},

		draw = function() {
			// elucia.debug("### ChartLine.draw ###");
			this.dataProcess();
			this.drawAxis();
			this.drawLine();
			this.drawArea();
		},

		dataProcess = function() {
			// elucia.debug("### ChartLine.dataProcess ###");

			// get max value
			if(!this.config.maxLock) {
				this.config.maxValue = 10;

				for(var key in this.data) {
					for(var key2 in this.data[key]) {
						if(this.data[key][key2] > this.config.maxValue) {
							this.config.maxValue = parseInt(this.data[key][key2] * 1.1);
						}
					}
				}
				// elucia.debug("@@@ MAX: " + this.config.maxValue);
			}

			// get y-unit
			this.config.unit.y = this.config.size.height / this.config.maxValue;

			// get x-unit
			this.config.unit.x = this.config.size.width / (this.config.dataSize - 1);

			for(var key in this.data) {
				this.point[key] = [];
				for(var key2 in this.data[key]) {
					this.point[key][key2] = [
						(key2) * this.config.unit.x,
						(this.config.maxValue - this.data[key][key2]) * this.config.unit.y
					];
				}
			}
		},

		drawAxis = function() {
			// elucia.debug("### ChartLine.drawAxis ###");
      		var tmpCanvas = this.axisLayer.get(0),
      			cvsWidth = this.config.size.width,
      			cvsHeight = this.config.size.height,
				ctx = tmpCanvas.getContext('2d');
      
      		var y4 = cvsHeight -10,
      			y1 = y4/4,
      			y2 = y4/2,
      			y3 = y1*3;
      		ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);    
      		ctx.lineWidth = 0.5;
      		ctx.strokeStyle = "#808080";
      		ctx.beginPath();
      		ctx.moveTo(0,y1);
      		ctx.lineTo(cvsWidth+10,y1);
      		ctx.moveTo(0,y2);
      		ctx.lineTo(cvsWidth+10,y2);
      		ctx.moveTo(0,y3);
      		ctx.lineTo(cvsWidth+10,y3);
      		ctx.moveTo(0,y4);
      		ctx.lineTo(cvsWidth+10,y4);
      		ctx.stroke();
		},

		drawLine = function() {
			// elucia.debug("### ChartLine.drawLine ###");

			var tmpCanvas = this.lineLayer.get(0),
				ctx = tmpCanvas.getContext('2d'),
				lineCap = ['butt','round','square'];

			ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
			for(var key in this.point) {	
				ctx.strokeStyle = this.config.color[key]["stroke"];
				ctx.lineWidth = 2;
				ctx.lineCap = 'round';
				ctx.beginPath();

				for(var i = 0; i < this.point[key].length; i++) {
					ctx.lineTo(this.point[key][i][0], this.point[key][i][1]);
				}

				ctx.stroke();
			}
		},

		drawArea = function() {
			// elucia.debug("### ChartLine.drawArea ###");

			var tmpCanvas = this.areaLayer.get(0),
				ctx = tmpCanvas.getContext('2d');

			ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
			for(var key in this.point) {
				ctx.fillStyle = this.config.color[key]["area"];
				ctx.beginPath();

				ctx.moveTo(0, this.config.size.height);
				for(var i = 0; i < this.point[key].length; i++) {
					ctx.lineTo(this.point[key][i][0], this.point[key][i][1]);
				}
				ctx.lineTo(this.config.size.width, this.config.size.height);
				ctx.fill();
			}
		},

		updateConfig = function(_data) {
			// elucia.debug("### ChartLine.updateConfig ###");
			if(typeof(_data) == "undefined") {
				_data = {};
			}

			for(var key in _data) {
				this.config[key] = _data[key];
			}
		},

		addData = function(_data) {
			// elucia.debug("### ChartLine.addData ###");
			try {
				for(var key in _data) {
					this.data[key].push(_data[key]); 
					while(this.config.dataSize > 0 && this.data[key].length > this.config.dataSize) {
						this.data[key].shift(1);
					}
				}
			}
			catch(e) {
				elucia.debug(e);
			}

			this.draw();
		},

		updateData = function(_data) {
			// elucia.debug("### ChartLine.updateData ###");
			var currData,
				dataSize = 0,
				tmpData;
			if(!elucia.isArray(_data)) {
				currData = [_data];
			}
			else {
				currData = _data;
			}
			
			for(var i = 0; i < _data.length; i++) {
				if(_data[i].length > dataSize) {
					dataSize = _data[i].length;
				}
			}

			for(var i = 0; i < dataSize; i++) {
				tmpData = [];
				for(var j = 0; j < _data.length; j++) {
					var tmpVal = 0;
					if(typeof(_data[j][i]) != "undefined") {
						tmpVal = _data[j][i];
					}
					tmpData.push(tmpVal);
				}
				this.addData(tmpData);
			}
		},
		getData = function() {
			return this.data;
		},

		that = {
			init: init,
			initConfig: initConfig,
			initData: initData,
			random: random,
			addData: addData,
			updateData: updateData,
			getData: getData,
			updateConfig: updateConfig,
			dataProcess: dataProcess,
			draw: draw,
			drawAxis: drawAxis,
			drawLine: drawLine,
			drawArea: drawArea
		};

		return that;
	};

	return ChartLine;
});