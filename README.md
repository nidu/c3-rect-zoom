Plugin for [c3](https://github.com/c3js/c3) which allows zooming to rectangular area.

Currently only very simple use case is covered and i haven't tested it with different features (etc. regions).

# Installation

```
npm install c3-rect-zoom
```

# Usage

`c3-rect-zoom` adds (or wraps if needed) `oninit` and `onrendered` callback to props you provide to `c3.generate`.

Pass chart props to c3RectZoom

```js
var c3 = require('c3')
var {c3RectZoom} = require('c3-rect-zoom')

c3.generate(c3RectZoom({
    data: ...
}, c3RectZoomSettings))
```

Or patch c3 to use as an option

```js
// Once somewhere in the beginning...
var c3 = require('c3')
require('c3-rect-zoom').patchC3(c3)

// Later when creating a chart
c3.generate({
    data: ...,
    c3RectZoom: {
        enabled: true
    }
})
```

# Settings

See interface `c3RectZoomSettings` in [index.ts](https://github.com/nidu/c3-rect-zoom/blob/master/src/index.ts).

# License

MIT