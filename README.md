# hx-plot

An [htmx](https://htmx.org) extension for rendering [Vega-Lite](https://vega.github.io/vega-lite/) charts from JSON.

Two builds are available:

| File | Size | How it loads Vega |
|------|------|-------------------|
| `hx-plot.min.js` | ~5 KB | Lazy CDN import on first use |
| `hx-plot.full.min.js` | ~1.3 MB | Fully self-contained |

## Usage

```html
<script src="https://unpkg.com/htmx.org@2"></script>

<!-- slim: loads vega + vega-lite from jsDelivr at runtime -->
<script src="hx-plot.min.js"></script>

<!-- or: fully bundled, no CDN dependency -->
<script src="hx-plot.full.min.js"></script>
```

### Inline JSON

Read a Vega-Lite spec from a `<script type="application/json">` element. Renders once on load.

```html
<script id="cfg" type="application/json">
{
  "mark": "point",
  "data": {"values": [{"x": 1, "y": 2}, {"x": 2, "y": 4}]},
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"}
  }
}
</script>

<div hx-ext="plot" hx-plot="#cfg" hx-target="#chart"></div>
<div id="chart"></div>
```

### Fetch from URL

Fetch a Vega-Lite spec as JSON from a server endpoint. Supports all htmx trigger and swap options.

```html
<div hx-ext="plot" hx-get="/api/chart" hx-trigger="load" hx-target="#chart"></div>
<div id="chart"></div>
```

### Live updates with view transitions

```html
<div hx-ext="plot"
     hx-get="/api/chart"
     hx-trigger="every 2s"
     hx-target="#chart"
     hx-swap="innerHTML transition:true"></div>
<div id="chart" style="view-transition-name: my-chart"></div>
```

## JSON format

The JSON must be a valid [Vega-Lite spec](https://vega.github.io/vega-lite/docs/). It is passed directly to `vegaLite.compile()` then rendered with Vega.

```json
{
  "mark": "line",
  "data": {"values": [{"x": 0, "y": 0}, {"x": 1, "y": 1}]},
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"}
  }
}
```

Layered charts, facets, and all other Vega-Lite features work as-is.

## Attributes

| Attribute | Description |
|-----------|-------------|
| `hx-ext="plot"` | Activates the extension on an element |
| `hx-plot="#selector"` | Render from inline JSON element (renders on page load) |
| `hx-get="/url"` | Fetch JSON from URL (respects `hx-trigger`) |
| `hx-target="#id"` | Where to render the chart (defaults to the element itself) |
| `hx-trigger="..."` | Standard htmx trigger — `load`, `every 2s`, `click`, etc. |
| `hx-swap="innerHTML transition:true"` | Enable View Transitions API on swap |

## Building

```sh
make install   # pnpm install
make           # build dist/hx-plot.min.js and dist/hx-plot.full.min.js
make serve     # start dev server at http://localhost:8000/demo/demo.html
make update    # upgrade vega + vega-lite and rebuild
make lint      # biome lint
```
