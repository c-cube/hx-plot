PLOT_SRC = node_modules/@observablehq/plot/dist/plot.umd.min.js

htmx-plot.js: $(PLOT_SRC) htmx-plot.src.js
	cat $(PLOT_SRC) htmx-plot.src.js > htmx-plot.js

install:
	pnpm install

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
