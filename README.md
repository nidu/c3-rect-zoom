Plugin for [c3](https://github.com/c3js/c3) which allows zooming to rectangular area.

Currently only very simple use case is covered and i haven't tested it with different features (etc. regions).

[Demo](http://jsfiddle.net/rg3w7gc5/3/)

# Installation

```
npm install c3-rect-zoom
```

Or just download `dist/c3-rect-zoom.js` and add it with script tag.

Also include css file `dist/c3-rect-zoom.css` somewhere.

# Usage

`c3-rect-zoom` adds (or wraps if needed) `oninit` and `onrendered` callback to props you provide to `c3.generate`.

```js
// Once somewhere in the beginning...
var c3 = require('c3')
require('c3-rect-zoom').patchC3(c3)

// Later when creating a chart
c3.generate({
    data: ...,
    c3RectZoom: {
        enabled: true,
        // ...c3RectZoom.Settings
    }
})
```

# Settings

See interface `c3RectZoom.Settings` in [c3-rect-zoom.d.ts](https://github.com/nidu/c3-rect-zoom/blob/master/dist/c3-rect-zoom.d.ts).

# License

MIT