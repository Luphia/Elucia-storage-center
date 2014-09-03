// JavaScript Document
define(function() {
/*
使用此widget需傳入四個參數
"data": {
    width: 寬度,
    height: 高度,
    fontSize: 百分比字的大小,
    url: 請求的位址
} 
*/
    var Application = function() {
        var node,
            data,
            
        init = function(_node,_data) {
            node = _node;
            data = _data;
            
            var width = _data.width,
                height = _data.height,
                twoPi = 2 * Math.PI,
                progress = 0,
                total = 1308573, // must be hard-coded if server doesn't report Content-Length
                formatPercent = d3.format(".0%");

            var arc = d3.svg.arc()
                .startAngle(0)
                .innerRadius(_data.width/16*3)
                .outerRadius(_data.width/4);

            var svg = d3.select("div.progressEvent").append("svg")
                .attr("width", width)
                .attr("height", height)
             .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var meter = svg.append("g")
                .attr("class", "progress-meter");

            meter.append("path")
                .attr("class", "background")
                .attr("d", arc.endAngle(twoPi));

            var foreground = meter.append("path")
                .attr("class", "foreground");

            var text = meter.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".35em");
            $('text').css('font-size',_data.fontSize);

            var currDsetroy = $.proxy(this, "destroy");

            d3.json(_data.url)
                .on("progress", function() {
                    var i = d3.interpolate(progress, d3.event.loaded / d3.event.total);
                    d3.transition().tween("progress", function() {
                        return function(t) {
                            progress = i(t);
                            foreground.attr("d", arc.endAngle(twoPi * progress));
                            text.text(formatPercent(progress));
                            if (progress==1)
                                currDsetroy();
                        };
                    });
                })
                .get(function(error, data) {
                    meter.transition().delay(250).attr("transform", "scale(0)");
                });

            return this;
        },

        destroy = function() {
            elucia.debug("### ProgressEvent.destroy ###");
            node.remove();
        },
        
        that = {
            init: init,
            destroy: destroy
        };
        
        return that;
    };
    
    return Application;
});