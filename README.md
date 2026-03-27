# htmx-plot

An [htmx](https://htmx.org) extension for rendering [Observable Plot](https://observablehq.com/plot/) charts from JSON. Plot is bundled in — no extra script tags needed.

## Usage

```html
<script src="https://unpkg.com/htmx.org@2"></script>
<script src="htmx-plot.js"></script>
```

### Inline JSON

Read plot options from a `<script type="application/json">` element on the page. Renders once on load.

```html
<script id="cfg" type="application/json">
{
  "marks": [
    { "type": "dot", "data": [{"x": 1, "y": 2}, {"x": 2, "y": 4}], "x": "x", "y": "y" }
  ]
}
</script>

<div hx-ext="plot" hx-plot="#cfg" hx-target="#chart"></div>
<div id="chart"></div>
```

### Fetch from URL

Fetch plot options as JSON from a server endpoint. Supports all htmx trigger and swap options.

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

Plot options are passed directly to [`Plot.plot(options)`](https://observablehq.com/plot/features/plots). Marks are described as plain objects with a `type` field matching an Observable Plot mark name:

```json
{
  "width": 640,
  "height": 300,
  "marks": [
    {
      "type": "line",
      "data": [{"x": 0, "y": 0}, {"x": 1, "y": 1}],
      "x": "x",
      "y": "y"
    },
    {
      "type": "dot",
      "data": [{"x": 0, "y": 0}, {"x": 1, "y": 1}],
      "x": "x",
      "y": "y"
    }
  ]
}
```

`type` maps to `Plot.<type>(data, options)` — any mark listed in the [Observable Plot docs](https://observablehq.com/plot/marks) works: `line`, `dot`, `bar`, `barX`, `barY`, `area`, `text`, `ruleX`, `ruleY`, etc.

All other top-level keys (`width`, `height`, `x`, `y`, `color`, `title`, …) are passed as-is to `Plot.plot()`.

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
make           # build dist/htmx-plot.js and dist/htmx-plot.min.js
make serve     # start dev server at http://localhost:8000/demo/demo.html
make update    # upgrade @observablehq/plot and rebuild
make lint      # biome lint
```
