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

			this.getData();
			myMonitors["fileAnalyze"] = elucia.monitors.addMonitor(
			{
				id: "",
				url: "/fileList",
				method: "get",
				period: 2000
			});

			this.listener = myMonitors["fileAnalyze"].regist(
			{
				"action": $.proxy(this, "getData")
			});

			return this;
		},

		getData = function() {
			var path = "/fileList",
				currUpdate = $.proxy(this, "updateData");

			elucia.rest.get({
				url: path,
				success: currUpdate
			});
		},

		updateData = function(_data) {
			var totalFiles = 0,
				totalSize = 0;

			for(var key in _data.data) {
				if(_data.data[key].file_type != "folder") {
					totalFiles += 1;
					totalSize += _data.data[key].bytes;
				}
			}

			var diskUsage = elucia.displayByte(totalSize),
				budgetEst = Math.ceil(totalSize * 24 * 30 * configuration.fee.diskGBH.value / 1024 / 1024 / 1024 * 100) / 100;

			$("div.summary div.block:nth-child(1) div.data div.value", this.node).text(totalFiles);
			$("div.summary div.block:nth-child(2) div.data div.value", this.node).text(diskUsage[0]);
			$("div.summary div.block:nth-child(2) div.data div.unit", this.node).text(diskUsage[1]);
			$("div.summary div.block:nth-child(3) div.data div.value", this.node).text(budgetEst);
			$("div.summary div.block:nth-child(3) div.data div.unit", this.node).text(configuration.fee.diskGBH.unit);


			if(this.data.length == _data.data.length) {
				return true; 
			}
			else {
				this.data = _data.data;
				this.clean();
			}


			elucia.debug("### appliaction.updateData ###");
			var colors = [
				"#5687d1",
				"#7b615c",
				"#de783b",
				"#6ab975",
				"#a173d1"
			];

			this.colors = {"folder": "#e5c468"};
			var csv = [];
			for(var key in _data.data) {
				csv.push([_data.data[key].file_name, _data.data[key].bytes, _data.data[key].file_type]);
				if(!this.colors[_data.data[key].file_type]) {
					var tmpColor;
					if(tmpColor = colors.pop()) {
						this.colors[_data.data[key].file_type] = tmpColor;
					}
					else {
						var r = parseInt(Math.random() * 128 + 100).toString(16),
							g = parseInt(Math.random() * 128 + 100).toString(16),
							b = parseInt(Math.random() * 128 + 100).toString(16);

						r.length == 1? (r = "0" + r): false;
						g.length == 1? (g = "0" + g): false;
						b.length == 1? (b = "0" + b): false;
						tmpColor = "#" + r + g + b;

						this.colors[_data.data[key].file_type] = tmpColor;
					}
				}
			}

			// Dimensions of sunburst.
			this.width = 500;
			this.height = 500;
			this.radius = Math.min(this.width, this.height) / 2;

			// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
			this.b = {
				w: 100, h: 30, s: 3, t: 10
			};

			// Mapping of step names to colors.


			// Total size of all segments; we set this later, after loading the data.
			var totalSize = 0; 

			var nodeChart = $("#chart", this.node)[0];

			this.vis = d3.select(nodeChart).append("svg:svg")
				.attr("width", this.width)
				.attr("height", this.height)
				.append("svg:g")
				.attr("id", "container")
				.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

			this.partition = d3.layout.partition()
				.size([2 * Math.PI, this.radius * this.radius])
				.value(function(d) { return d.size; });

			this.arc = d3.svg.arc()
				.startAngle(function(d) { return d.x; })
				.endAngle(function(d) { return d.x + d.dx; })
				.innerRadius(function(d) { return Math.sqrt(d.y); })
				.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

			// Use d3.text and d3.csv.parseRows so that we do not need to have a header
			// row, and can receive the csv as an array of arrays.

			var json = buildHierarchy(csv);

			this.createVisualization(json);

		},

		createVisualization = function(json) {
			var that = this;
			// Basic setup of page elements.
			this.initializeBreadcrumbTrail();
			this.drawLegend();
			d3.select("#togglelegend").on("click", toggleLegend);
			toggleLegend(false);

			// Bounding circle underneath the sunburst, to make it easier to detect
			// when the mouse leaves the parent g.

			this.vis.append("svg:circle")
				.attr("r", this.radius)
				.style("opacity", 0);

			// For efficiency, filter nodes to keep only those large enough to see.
			var nodes = this.partition.nodes(json)
				.filter(function(d) {
					return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
				});

			var currMouseover = $.proxy(this, "mouseover"),
				currMouseleave = $.proxy(this, "mouseleave");

			var path = this.vis.data([json]).selectAll("path")
				.data(nodes)
				.enter().append("svg:path")
				.attr("display", function(d) { return d.depth ? null : "none"; })
				.attr("d", this.arc)
				.attr("fill-rule", "evenodd")
				.style("fill", function(d) { return that.colors[d.type]; })
				.style("opacity", 1)
				.on("mouseover", currMouseover);

			// Add the mouseleave handler to the bounding circle.
			d3.select("#container").on("mouseleave", currMouseleave);

			// Get total size of the tree = value of root node from partition.
			totalSize = path.node().__data__.value;
 		},

		mouseover = function(d) {
			var percentage = (100 * d.value / totalSize).toPrecision(3);
			var percentageString = percentage + "%";
			if (percentage < 0.1) {
				percentageString = "< 0.1%";
			}

			var subdir = "";
			if(name.children) { }
			var description = d.name + "<br/>size: " + elucia.displayByte(d.value)[2];

			d3.select("span.percentage")
				.text(percentageString);

			d3.select("span.descript")
				.html(description);

			d3.select("#explanation")
				.style("visibility", "");

			var sequenceArray = getAncestors(d);
			this.updateBreadcrumbs(sequenceArray, percentageString);

			// Fade all the segments.
			d3.selectAll("path")
				.style("opacity", 0.3);

			// Then highlight only those that are an ancestor of the current segment.
			this.vis.selectAll("path")
				.filter(function(node) {
					return (sequenceArray.indexOf(node) >= 0);
				})
				.style("opacity", 1);
		},

		mouseleave = function(d) {
			// Hide the breadcrumb trail
			d3.select("#trail")
				.style("visibility", "hidden");

			// Deactivate all segments during transition.
			d3.selectAll("path").on("mouseover", null);

			// Transition each segment to full opacity and then reactivate it.
			var currMouseover = $.proxy(this, "mouseover");
			d3.selectAll("path")
				.transition()
				.duration(200)
				.style("opacity", 1)
				.each("end", function() {

					d3.select(this).on("mouseover", currMouseover);
				});

			d3.select("#explanation")
				.transition()
				.duration(200)
				.style("visibility", "hidden");
		},

		getAncestors = function(node) {
			var path = [];
			var current = node;
			while (current.parent) {
				path.unshift(current);
				current = current.parent;
			}
			return path;
		},

		initializeBreadcrumbTrail = function() {
			// Add the svg area.
			var trail = d3.select("#sequence").append("svg:svg")
				.attr("width", this.width + 180)
				.attr("height", 50)
				.attr("id", "trail");
			// Add the label at the end, for the percentage.
			trail.append("svg:text")
				.attr("id", "endlabel")
				.style("fill", "#000");
		},

		breadcrumbPoints = function(d, i) {
			var points = [];
			points.push("0,0");
			points.push(this.b.w + ",0");
			points.push(this.b.w + this.b.t + "," + (this.b.h / 2));
			points.push(this.b.w + "," + this.b.h);
			points.push("0," + this.b.h);
			if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
				points.push(this.b.t + "," + (this.b.h / 2));
			}
			return points.join(" ");
		},

		updateBreadcrumbs = function (nodeArray, percentageString) {
			var that = this;
			// Data join; key function combines name and depth (= position in sequence).
			var g = d3.select("#trail")
				.selectAll("g")
				.data(nodeArray, function(d) { return d.name + d.depth; });

			// Add breadcrumb and label for entering nodes.
			var entering = g.enter().append("svg:g");

			var currBreadcrumbPoints = $.proxy(this, "breadcrumbPoints");

			entering.append("svg:polygon")
				.attr("points", currBreadcrumbPoints)
				.style("fill", function(d) { return that.colors[d.type]; });

			entering.append("svg:text")
				.attr("x", (this.b.w + this.b.t) / 2)
				.attr("y", this.b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(function(d) { return d.name; });

			// Set position for entering and updating nodes.
			g.attr("transform", function(d, i) {
				return "translate(" + i * (that.b.w + that.b.s) + ", 0)";
			});

			// Remove exiting nodes.
			g.exit().remove();

			// Now move and update the percentage at the end.
			d3.select("#trail").select("#endlabel")
				.attr("x", (nodeArray.length + 0.5) * (this.b.w + this.b.s))
				.attr("y", this.b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(percentageString);

			// Make the breadcrumb trail visible, if it's hidden.
			d3.select("#trail")
				.style("visibility", "");
		},

		drawLegend = function() {
			// Dimensions of legend item: width, height, spacing, radius of rounded rect.
			var that = this;

			var li = {
				w: 150, h: 30, s: 3, r: 3
			};

			var legend = d3.select("#legend").append("svg:svg")
					.attr("width", li.w)
					.attr("height", d3.keys(that.colors).length * (li.h + li.s));

			var g = legend.selectAll("g")
					.data(d3.entries(that.colors))
					.enter().append("svg:g")
					.attr("transform", function(d, i) {
						return "translate(0," + i * (li.h + li.s) + ")";
					});

			g.append("svg:rect")
				.attr("rx", li.r)
				.attr("ry", li.r)
				.attr("width", li.w)
				.attr("height", li.h)
				.style("fill", function(d) { return that.colors[d.key]; });

			g.append("svg:text")
				.attr("x", li.w / 2)
				.attr("y", li.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(function(d) { return d.key; });
		},

		toggleLegend = function(x) {
			/*
			var legend = d3.select("#legend");
			if (x || legend.style("visibility") == "hidden") {
				legend.style("visibility", "");
			} else {
				legend.style("visibility", "hidden");
			}
			*/
		},

		buildHierarchy = function(csv) {
			var root = {"name": "root", "type": "folder", "children": []};
			for (var i = 0; i < csv.length; i++) {
				var sequence = csv[i][0];
				var size = +csv[i][1];
				var type = csv[i][2];

				if (isNaN(size)) { // e.g. if this is a header row
					continue;
				}

				var parts = sequence.split("/");
				var currentNode = root;
				for (var j = 0; j < parts.length; j++) {
					var children = currentNode["children"];
					var nodeName = parts[j];
					var childNode;
					if (j + 1 < parts.length) {
					// Not yet at the end of the sequence; move down the tree.
						var foundChild = false;
						for (var k = 0; k < children.length; k++) {
							if (children[k]["name"] == nodeName) {
								childNode = children[k];
								foundChild = true;
								break;
							}
						}
						// If we don't already have a child node for this branch, create it.
						if (!foundChild) {
							childNode = {"name": nodeName, "type":"folder", "children": []};
							children.push(childNode);
						}
						currentNode = childNode;
					} else {
					// Reached the end of the sequence; create a leaf node.
						childNode = {"name": nodeName, "size": size, "type": type};
						children.push(childNode);
					}
				}
			}
			return root;
		},

		clean = function() {
			$("#legend", this.node).html("");
			$("#chart svg", this.node).remove();
		},

		destroy = function() {
			elucia.debug("### appliaction.destroy ###");
			myMonitors["fileAnalyze"].destroy();
		},

		that = {
			init: init,
			getData: getData,
			updateData: updateData,
			createVisualization: createVisualization,
			mouseover: mouseover,
			mouseleave: mouseleave,
			getAncestors: getAncestors,
			initializeBreadcrumbTrail: initializeBreadcrumbTrail,
			breadcrumbPoints: breadcrumbPoints,
			updateBreadcrumbs: updateBreadcrumbs,
			drawLegend: drawLegend,
			toggleLegend: toggleLegend,
			buildHierarchy: buildHierarchy,
			clean: clean,

			destroy: destroy
		};

		return that;
	};

	return Application;
});