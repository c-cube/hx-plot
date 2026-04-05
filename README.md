# hx-plot

**hx-plot** is an [htmx](https://htmx.org) extension that renders [Vega-Lite](https://vega.github.io/vega-lite/) charts directly from JSON — inline on the page or fetched from a server endpoint. Add `hx-ext="plot"` to any element and point it at a JSON spec; htmx handles the rest.

> **[Live playground →](https://c-cube.github.io/hx-plot/)** · [GitHub](https://github.com/c-cube/hx-plot)

Two builds are available:

| File | Size | How it loads Vega |
|------|------|-------------------|
| `hx-plot.min.js` | ~2.5 KiB | Lazy CDN import on first use |
| `hx-plot.full.min.js` | ~750 kiB | Fully self-contained |

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

### Error handling

Upon error, a `ht-plot:error` event is emitted, and a message is printed
on the console.

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
| `hx-swap-on-error` | On error, replace the chart container with a `<div class="hx-plot-error">` |

## Events

| Event | Fired on | Detail |
|-------|----------|--------|
| `hx-plot:render-start` | container | `{ spec }` |
| `hx-plot:render-done` | container | `{ spec }` |
| `hx-plot:error` | container (or `document`) | `{ error, spec? }` |

All events bubble. Listen on a parent element to catch errors from multiple charts.

## Full examples

### Inline JSON

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/htmx.org@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/hx-plot/dist/hx-plot.min.js"></script>
</head>
<body>

<script id="spec" type="application/json">
{
  "mark": "point",
  "data": {"values": [{"x": 1, "y": 2}, {"x": 2, "y": 4}, {"x": 3, "y": 1}]},
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"}
  }
}
</script>

<div hx-ext="plot" hx-plot="#spec" hx-target="#chart"></div>
<div id="chart"></div>

</body>
</html>
```

### Fetch from URL (e.g. on page load)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/htmx.org@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/hx-plot/dist/hx-plot.min.js"></script>
</head>
<body>

<div hx-ext="plot"
     hx-get="/api/chart"
     hx-trigger="load"
     hx-target="#chart"></div>
<div id="chart"></div>

</body>
</html>
```

### Live updates every 2 seconds with view transitions

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/htmx.org@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/hx-plot/dist/hx-plot.min.js"></script>
  <style>
    #chart { view-transition-name: my-chart; }
    ::view-transition-old(my-chart),
    ::view-transition-new(my-chart) { animation-duration: 0.3s; }
  </style>
</head>
<body>

<div hx-ext="plot"
     hx-get="/api/chart"
     hx-trigger="load, every 2s"
     hx-target="#chart"
     hx-swap="innerHTML transition:true"></div>
<div id="chart"></div>

</body>
</html>
```

### Error handling

```html
<div id="charts">
  <div hx-ext="plot" hx-get="/api/chart" hx-trigger="load" hx-target="#chart"></div>
  <div id="chart"></div>
</div>

<script>
  document.getElementById('charts').addEventListener('hx-plot:error', e => {
    console.error('chart failed:', e.detail.error);
  });
</script>
```

## Building

```sh
make install   # pnpm install
make           # build dist/hx-plot.min.js and dist/hx-plot.full.min.js
make serve     # start dev server at http://localhost:8000/demo/demo.html
make update    # upgrade vega + vega-lite and rebuild
make lint      # biome lint
```
