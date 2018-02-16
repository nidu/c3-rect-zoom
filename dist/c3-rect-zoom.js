/// <reference types="d3"/>
/// <reference types="c3"/>
/// <reference path="./../dist/c3-rect-zoom.d.ts"/>
(function (window) {
    var resetBtnSize = { width: 24, height: 24 };
    var d3 = window['d3'] || window['require']("d3");
    function patchC3(c3) {
        var generate = c3.generate;
        c3.generate = function (chartProps) {
            if (chartProps.c3RectZoom && chartProps.c3RectZoom.enabled) {
                install(chartProps, chartProps.c3RectZoom);
            }
            return generate(chartProps);
        };
    }
    function install(chartProps, optSettings) {
        var svg;
        var chart;
        var dragStart;
        var initialRange;
        var settings = {
            resetBtnPadding: (typeof optSettings.resetBtnPadding == 'number' ? { x: optSettings.resetBtnPadding, y: optSettings.resetBtnPadding } : optSettings.resetBtnPadding) || { x: 20, y: 20 },
            resetBtnPos: optSettings.resetBtnPos || 'top-right',
            minRectSize: (typeof optSettings.minRectSize == 'number' ? { width: optSettings.minRectSize, height: optSettings.minRectSize } : optSettings.minRectSize) || { width: 10, height: 10 }
        };
        function mount(chartProps) {
            var oninit = chartProps.oninit;
            chartProps.oninit = function () {
                if (oninit)
                    oninit();
                chart = this;
                svg = this.svg;
                svg
                    .on('mouseup.c3RectZoom', onMouseUp)
                    .on('mousemove.c3RectZoom', onMouseMove);
                svg.selectAll('.c3-zoom-rect')
                    .on('mousedown.c3RectZoom', onMouseDown);
            };
            var onrendered = chartProps.onrendered;
            chartProps.onrendered = function () {
                if (onrendered)
                    onrendered();
                var rect = svg.select('.c3-rect-zoom');
                svg.selectAll('.c3-event-rect')
                    .on('mousedown.c3RectZoom', onMouseDown);
            };
            var onmouseout = chartProps.onmouseout;
            chartProps.onmouseout = function () {
                if (onmouseout)
                    onmouseout();
                onMouseUp();
            };
            return chartProps;
        }
        function getResetBtn() {
            var reset = svg.select('.c3-rect-zoom-reset');
            if (reset.empty()) {
                return svg.append('image')
                    .classed('c3-rect-zoom-reset', true)
                    .attr('xlink:href', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADFUlEQVRIS62VS2gTURSG/3OTWGt9thafIAriRlB8oAhqnLaLKm5sJ8nKZmJpFetWBFGLK4ugglJFtBlFaJNBRavowiQjiN0oBXWhC3cipRZFk2qsmXtkhEhe06nSWc4583/nv+ecOwSHx7+vfbnHZ+1hyHUMUQtGFqD3QkgzMaA/A8BO3xa+p9KkxpbIKumxeiyIHYJ4kFi8YOCTAFczsAagZhDPJfDJREwfcIMUAXYFIi0S3Otl7rFq0GvqeraSgBLStsHCJRC9q0rXhB89uvjTCfQXYIsTrAuCafcTQ3/tVpmqqjPGqKaPmWrrkdlrGIZV6Zs/APtYfnl4yMfcOBXxvJCqqp4xmvNAMA8ljOhpR4ASaDOIaShh6OfcKi+N+9XwYkH8SuZ8G8w71z6UxsmeFvZaL2kWr3A6czeoEtDOAsgm49ETZYCGoNYpwZtTMb3dTchxpEORTcLKXUsaN9eXAZRgWy/Y8yoZ77vyvwC7F6M06xuNrpxnmt25oj3YFdQGwGSk4n23/zRc7ZgnaeKeG4yZTqWM6NN8nr+1bQS+qrVm/9WxYkBA0wXwJBGP3rIDGzs6fAu+5La4AXJe79tCsZ2t2lei6mWm0ZspAUROEHhGpQa5QfLxplBk6YTk4afx6KLyJofC21mK88l436apCpbmNaiRA1JwUyoWDZUBAJAS1N6BEE4ORJ//B4QUdf8wQRxLGPrjSgA0BMMhlnS0DpmthmFM/AtEUbUuJhlMxW9sd9xkO6AEIv0MaS3k8Tane6VUoDEQaZSSB6VHbDZj199MCmhuPlL1Y3bmLhERs9RMQx+ZxAkpqnYYjLMQmEngh7U8vq+S+6Lr2l6Yz5h9nEl2AeKGFBSrt9LDeUf2tEgLzYzcESZKM3kPedg6w6A9TpCyH45dtX0/Ca/VCbb2WkSrSSLNENUQyApCSkjW8w21nU/MSd+2IWD5oA7fWwqdVAQUHo3f3+3Fko/zkfNmS5conzcZxBUw1YkqhEjGYD0yrbaTaQPYhRQ5Ae7XcUadVkAphAgHpx2Qh2Tnpg+kYvrl3/9adJAnjeubAAAAAElFTkSuQmCC')
                    .attr('width', resetBtnSize.width)
                    .attr('height', resetBtnSize.height)
                    .on('click.c3RectZoom', resetZoom);
            }
            else {
                return reset;
            }
        }
        function showResetBtn() {
            var x, y;
            var p = settings.resetBtnPadding;
            var w = chart.currentWidth;
            var h = chart.currentHeight;
            switch (settings.resetBtnPos) {
                case 'top-left':
                case 'bottom-left':
                    x = p.x;
                    break;
                default:
                    x = w - p.x - resetBtnSize.width;
                    break;
            }
            switch (settings.resetBtnPos) {
                case 'top-left':
                case 'top-right':
                    y = p.y;
                    break;
                default:
                    y = h - p.y - resetBtnSize.height;
                    break;
            }
            getResetBtn()
                .style('transform', "translate(" + x + "px," + y + "px)")
                .classed('visible', true);
        }
        function getRect() {
            var rect = svg.select('.c3-rect-zoom');
            if (rect.empty()) {
                return svg.append('rect')
                    .classed('c3-rect-zoom', true);
            }
            else {
                return rect;
            }
        }
        function resetZoom() {
            if (initialRange) {
                chart.config.axis_x_min = initialRange.min.x;
                chart.config.axis_y_min = initialRange.min.y;
                chart.config.axis_y2_min = initialRange.min.y2;
                chart.config.axis_x_max = initialRange.max.x;
                chart.config.axis_y_max = initialRange.max.y;
                chart.config.axis_y2_max = initialRange.max.y2;
                chart.redraw({ withUpdateOrgXDomain: true, withUpdateOrgYDomain: true });
                getResetBtn().classed('visible', false);
                initialRange = null;
            }
        }
        function zoomTo(p1, p2) {
            showResetBtn();
            if (!initialRange) {
                initialRange = chart.api.axis.range();
            }
            var range = {
                min: {
                    x: Math.min(p1.x, p2.x),
                    y: Math.min(p1.y, p2.y),
                    y2: Math.min(p1.y2, p2.y2),
                },
                max: {
                    x: Math.max(p1.x, p2.x),
                    y: Math.max(p1.y, p2.y),
                    y2: Math.max(p1.y2, p2.y2),
                }
            };
            chart.api.axis.range(range);
        }
        function onMouseDown() {
            dragStart = eventToPoint(d3.event);
            getRect().classed('visible', true);
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
            if (!dragStart)
                return;
            var p1 = screenPointToDomain(dragStart);
            var dragEnd = eventToPoint(d3.event);
            var p2 = screenPointToDomain(dragEnd);
            getRect()
                .classed('visible', false)
                .attr('width', 0)
                .attr('height', 0);
            if (shouldZoom(dragStart, dragEnd)) {
                zoomTo(p1, p2);
            }
            dragStart = null;
        }
        function shouldZoom(p1, p2) {
            var width = Math.abs(p2.x - p1.x);
            var height = Math.abs(p2.y - p1.y);
            return width >= settings.minRectSize.width && height >= settings.minRectSize.height;
        }
        function screenPointToDomain(p) {
            var b = workingAreaBounds();
            return {
                x: d3.scale.linear().domain(chart.getXDomain(chart.data.targets)).invert((p.x - b.x) / b.w),
                y: d3.scale.linear().domain(chart.getYDomain(chart.data.targets)).invert((b.h - p.y + b.y) / b.h),
                y2: d3.scale.linear().domain(chart.getYDomain(chart.data.targets, 'y2')).invert((b.h - p.y + b.y) / b.h)
            };
        }
        function eventToPoint(e) {
            return trimPoint({
                x: e.layerX,
                y: e.layerY
            });
        }
        function trimPoint(p) {
            var b = workingAreaBounds();
            return {
                x: Math.max(b.x, Math.min(b.x + b.w, p.x)),
                y: Math.max(b.y, Math.min(b.y + b.h, p.y))
            };
        }
        function workingAreaBounds() {
            var svgBox = svg.node().getBoundingClientRect();
            var c3ChartBox = svg.select('.c3-event-rects').node().getBoundingClientRect();
            var x = c3ChartBox.left - svgBox.left;
            var y = c3ChartBox.top - svgBox.top;
            var w = c3ChartBox.width;
            var h = c3ChartBox.height;
            return { x: x, y: y, w: w, h: h };
        }
        return mount(chartProps);
    }
    var c3RectZoom = { patchC3: patchC3, install: install };
    if (typeof define === 'function' && define.amd) {
        define('c3RectZoom', ['d3', 'c3'], function () { return c3RectZoom; });
    }
    else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = c3RectZoom;
    }
    else {
        window['c3RectZoom'] = c3RectZoom;
    }
}(window));
//# sourceMappingURL=c3-rect-zoom.js.map