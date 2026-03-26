build: install dist/htmx-plot.js

dist/plot.bundle.js: node_modules/@observablehq/plot
	mkdir -p dist
	node_modules/.bin/esbuild @observablehq/plot \
		--bundle --format=iife --global-name=Plot --minify \
		--outfile=dist/plot.bundle.js

dist/htmx-plot.js: dist/plot.bundle.js htmx-plot.src.js
	cat dist/plot.bundle.js htmx-plot.src.js > dist/htmx-plot.js

install:
	pnpm install

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
