
build: htmx-plot.js

plot.bundle.js: node_modules/@observablehq/plot
	node_modules/.bin/esbuild @observablehq/plot \
		--bundle --format=iife --global-name=Plot --minify \
		--outfile=plot.bundle.js


htmx-plot.js: plot.bundle.js htmx-plot.src.js
	cat plot.bundle.js htmx-plot.src.js > htmx-plot.js

htmx-plot.src.js: install

install:
	pnpm install

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
