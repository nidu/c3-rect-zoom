/// <reference types="d3"/>
/// <reference types="c3"/>
/// <reference path="./../dist/c3-rect-zoom.d.ts"/>

(function(window) {
	interface c3RectZoomSettingsInternal { 
		resetBtnPadding?: {x: number, y: number},
		resetBtnPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
		minRectSize?: {width: number, height: number}
	}

	const resetBtnSize = {width: 24, height: 24}
	var d3 = window['d3'] || window['require']("d3")

	function patchC3(c3): void {
		const generate = c3.generate
		c3.generate = function(chartProps) {
			if (chartProps.c3RectZoom && chartProps.c3RectZoom.enabled) {
				install(chartProps, chartProps.c3RectZoom)
			}
			return generate(chartProps)
		}
	}

	function install(chartProps: c3.ChartConfiguration, optSettings: c3RectZoom.Settings): c3.ChartConfiguration {
		let svg
		let chart
		let dragStart
		let initialRange
		let settings: c3RectZoomSettingsInternal = {
			resetBtnPadding: (typeof optSettings.resetBtnPadding == 'number' ? {x: optSettings.resetBtnPadding, y: optSettings.resetBtnPadding} : optSettings.resetBtnPadding) || {x: 20, y: 20},
			resetBtnPos: optSettings.resetBtnPos || 'top-right',
			minRectSize: (typeof optSettings.minRectSize == 'number' ? {width: optSettings.minRectSize, height: optSettings.minRectSize} : optSettings.minRectSize) || {width: 10, height: 10}
		}

		const isIE = window.navigator.userAgent.indexOf('Trident') != -1;
		const isFirefox = window.navigator.userAgent.indexOf('Firefox') != -1;

		function mount(chartProps: c3.ChartConfiguration) {
			const oninit = chartProps.oninit
			chartProps.oninit = function() {
				if (oninit) oninit()
				chart = this
				svg = this.svg
				svg
					.on('mouseup.c3RectZoom', onMouseUp)
					.on('mousemove.c3RectZoom', onMouseMove)
				svg.selectAll('.c3-zoom-rect')
					.on('mousedown.c3RectZoom', onMouseDown)
			}

			const onrendered = chartProps.onrendered
			chartProps.onrendered = () => {
				if (onrendered) onrendered()
				const rect = svg.select('.c3-rect-zoom')

				svg.selectAll('.c3-event-rect')
					.on('mousedown.c3RectZoom', onMouseDown)
			}

			const onmouseout = chartProps.onmouseout
			chartProps.onmouseout = () => {
				if (onmouseout) onmouseout()
				onMouseUp()
			}

			return chartProps
		}

		function getResetBtn() {
			const reset = svg.select('.c3-rect-zoom-reset')
			if (reset.empty()) {
				return svg.append('image')
					.classed('c3-rect-zoom-reset', true)
					// https://www.iconfinder.com/icons/646193/maginifying_out_search_zoom_icon#size=24
					.attr('xlink:href', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADFUlEQVRIS62VS2gTURSG/3OTWGt9thafIAriRlB8oAhqnLaLKm5sJ8nKZmJpFetWBFGLK4ugglJFtBlFaJNBRavowiQjiN0oBXWhC3cipRZFk2qsmXtkhEhe06nSWc4583/nv+ecOwSHx7+vfbnHZ+1hyHUMUQtGFqD3QkgzMaA/A8BO3xa+p9KkxpbIKumxeiyIHYJ4kFi8YOCTAFczsAagZhDPJfDJREwfcIMUAXYFIi0S3Otl7rFq0GvqeraSgBLStsHCJRC9q0rXhB89uvjTCfQXYIsTrAuCafcTQ3/tVpmqqjPGqKaPmWrrkdlrGIZV6Zs/APtYfnl4yMfcOBXxvJCqqp4xmvNAMA8ljOhpR4ASaDOIaShh6OfcKi+N+9XwYkH8SuZ8G8w71z6UxsmeFvZaL2kWr3A6czeoEtDOAsgm49ETZYCGoNYpwZtTMb3dTchxpEORTcLKXUsaN9eXAZRgWy/Y8yoZ77vyvwC7F6M06xuNrpxnmt25oj3YFdQGwGSk4n23/zRc7ZgnaeKeG4yZTqWM6NN8nr+1bQS+qrVm/9WxYkBA0wXwJBGP3rIDGzs6fAu+5La4AXJe79tCsZ2t2lei6mWm0ZspAUROEHhGpQa5QfLxplBk6YTk4afx6KLyJofC21mK88l436apCpbmNaiRA1JwUyoWDZUBAJAS1N6BEE4ORJ//B4QUdf8wQRxLGPrjSgA0BMMhlnS0DpmthmFM/AtEUbUuJhlMxW9sd9xkO6AEIv0MaS3k8Tane6VUoDEQaZSSB6VHbDZj199MCmhuPlL1Y3bmLhERs9RMQx+ZxAkpqnYYjLMQmEngh7U8vq+S+6Lr2l6Yz5h9nEl2AeKGFBSrt9LDeUf2tEgLzYzcESZKM3kPedg6w6A9TpCyH45dtX0/Ca/VCbb2WkSrSSLNENUQyApCSkjW8w21nU/MSd+2IWD5oA7fWwqdVAQUHo3f3+3Fko/zkfNmS5conzcZxBUw1YkqhEjGYD0yrbaTaQPYhRQ5Ae7XcUadVkAphAgHpx2Qh2Tnpg+kYvrl3/9adJAnjeubAAAAAElFTkSuQmCC')
					.attr('width', resetBtnSize.width)
					.attr('height', resetBtnSize.height)
					.on('click.c3RectZoom', resetZoom)
			} else {
				return reset
			}
		}

		function showResetBtn() {
			let x, y
			const p = settings.resetBtnPadding
			const w = chart.currentWidth
			const h = chart.currentHeight
			switch (settings.resetBtnPos) {
				case 'top-left':
				case 'bottom-left':
					x = p.x
					break
				default:
					x = w - p.x - resetBtnSize.width
					break
			}
			switch (settings.resetBtnPos) {
				case 'top-left':
				case 'top-right':
					y = p.y
					break
				default:
					y = h - p.y - resetBtnSize.height
					break
			}
			getResetBtn()
				.attr('x', x)
				.attr('y', y)
				.classed('visible', true)
		}

		function getRect() { 
			const rect = svg.select('.c3-rect-zoom')
			if (rect.empty()) {
				return svg.append('rect')
					.classed('c3-rect-zoom', true)
			} else {
				return rect
			}
		}

		function resetZoom() {
			if (initialRange) {
				chart.config.axis_x_min = initialRange.min.x
				chart.config.axis_y_min = initialRange.min.y
				chart.config.axis_y2_min = initialRange.min.y2

				chart.config.axis_x_max = initialRange.max.x
				chart.config.axis_y_max = initialRange.max.y
				chart.config.axis_y2_max = initialRange.max.y2

				chart.redraw({withUpdateOrgXDomain: true, withUpdateOrgYDomain: true})

				getResetBtn().classed('visible', false)
				initialRange = null
			}
		}

		function zoomTo(p1, p2) {
			showResetBtn()
			if (!initialRange) {
				initialRange = chart.api.axis.range()
			}
			const range = {
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
			}
			chart.api.axis.range(range)
		}

		function onMouseDown() {
			dragStart = eventToPoint(d3.event)
			getRect().classed('visible', true)
		}

		function onMouseMove() {
			if (!dragStart) return

			const p1 = dragStart
			const p2 = eventToPoint(d3.event)
			getRect()
				.attr('x', Math.min(p1.x, p2.x))
				.attr('y', Math.min(p1.y, p2.y))
				.attr('width', Math.abs(p2.x - p1.x))
				.attr('height', Math.abs(p2.y - p1.y))
		}

		function onMouseUp() {
			if (!dragStart) return

			const p1 = screenPointToDomain(dragStart)
			const dragEnd = eventToPoint(d3.event)
			const p2 = screenPointToDomain(dragEnd)
			getRect()
				.classed('visible', false)
				.attr('width', 0)
				.attr('height', 0)
			if (shouldZoom(dragStart, dragEnd)) {
				zoomTo(p1, p2)
			}
			dragStart = null
		}

		function shouldZoom(p1, p2) {
			const width = Math.abs(p2.x - p1.x)
			const height = Math.abs(p2.y - p1.y)
			return width >= settings.minRectSize.width && height >= settings.minRectSize.height
		}

		function screenPointToDomain(p) {
			const b = workingAreaBounds()

			return {
				x: d3.scale.linear().domain(chart.getXDomain(chart.data.targets)).invert((p.x - b.x) / b.w),
				y: d3.scale.linear().domain(chart.getYDomain(chart.data.targets)).invert((b.h - p.y + b.y) / b.h),
				y2: d3.scale.linear().domain(chart.getYDomain(chart.data.targets, 'y2')).invert((b.h - p.y + b.y) / b.h)
			}
		}

		function eventToPoint(e) {
			let p
			if (isIE || isFirefox) {
				p = {x: e.layerX, y: e.layerY}
			} else {
				p = {x: e.offsetX, y: e.offsetY}
			}
			return trimPoint(p)
		}

		function trimPoint(p) {
			const b = workingAreaBounds()

			return {
				x: Math.max(b.x, Math.min(b.x + b.w, p.x)),
				y: Math.max(b.y, Math.min(b.y + b.h, p.y))
			}
		}

		function workingAreaBounds() {
			const svgBox = svg.node().getBoundingClientRect()
			const c3ChartBox = svg.select('.c3-zoom-rect').node().getBoundingClientRect()
			const x = c3ChartBox.left - svgBox.left
			const y = c3ChartBox.top - svgBox.top
			const w = c3ChartBox.width
			const h = c3ChartBox.height
			return {x, y, w, h}
		}

		return mount(chartProps)
	}

	const c3RectZoom = {patchC3, install}

	if (typeof define === 'function' && define.amd) {
        define('c3RectZoom', ['d3', 'c3'], function () { return c3RectZoom })
    } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = c3RectZoom
    } else {
        window['c3RectZoom'] = c3RectZoom
    }
}(window))
