htmx-plot.js: plot.min.js htmx-plot.src.js
	cat plot.min.js htmx-plot.src.js > htmx-plot.js

install:
	pnpm install

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
