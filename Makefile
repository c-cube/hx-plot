htmx-plot.js: plot.min.js htmx-plot.src.js
	cat plot.min.js htmx-plot.src.js > htmx-plot.js

lint:
	biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
