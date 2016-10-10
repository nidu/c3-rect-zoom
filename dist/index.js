"use strict";
var DEBUG;
var chart1;
function addRectZoom(chartProps) {
    var svg;
    var chart;
    var dragStart;
    chartProps.oninit = function () {
        chart1 = chart = this;
        svg = this.svg;
    };
    chartProps.onrendered = function () {
        var rect = svg.select('.c3-rect-zoom');
        console.log('mountRectZoom');
        svg.selectAll('.c3-event-rect')
            .on('mousedown', function () {
            dragStart = eventToPoint(d3.event);
            getRect().classed('visible', true);
        })
            .on('mouseup', onMouseUp)
            .on('mousemove', onMouseMove);
    };
    function getRect() {
        var rect = svg.select('.c3-rect-zoom');
        if (rect.empty()) {
            return svg.append('rect')
                .classed('c3-rect-zoom', true)
                .on('mouseup', onMouseUp)
                .on('mousemove', onMouseMove);
        }
        else {
            return rect;
        }
    }
    function onMouseMove() {
        if (!dragStart)
            return;
        var p1 = dragStart;
        var p2 = eventToPoint(d3.event);
        getRect()
            .attr('x', Math.min(p1.x, p2.x))
            .attr('y', Math.min(p1.y, p2.y))
            .attr('width', Math.abs(p2.x - p1.x))
            .attr('height', Math.abs(p2.y - p1.y));
    }
    function onMouseUp() {
        var _a = screenPointToDomain(d3.event), x = _a.x, y = _a.y;
        console.log('onMouseUp', d3.event, x, y);
        var dragEnd = eventToPoint(d3.event);
        getRect().classed('visible', false);
        dragStart = null;
    }
    function screenPointToDomain(e) {
        return {
            x: d3.scale.linear().domain(chart.getXDomain(chart.data.targets)).invert(d3.event.layerX / chart.currentWidth),
            y: d3.scale.linear().domain(chart.getYDomain(chart.data.targets)).invert((chart.currentHeight - d3.event.layerY) / chart.currentHeight)
        };
    }
    return chartProps;
}
exports.addRectZoom = addRectZoom;
function eventToPoint(e) {
    return {
        x: e.layerX,
        y: e.layerY
    };
}
