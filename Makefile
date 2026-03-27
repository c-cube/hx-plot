build: install dist/htmx-plot.js dist/htmx-plot.min.js

dist/htmx-plot.js: htmx-plot.src.js node_modules/@observablehq/plot
	mkdir -p dist
	node_modules/.bin/esbuild htmx-plot.src.js --bundle --format=iife --outfile=dist/htmx-plot.js

dist/htmx-plot.min.js: dist/htmx-plot.js
	node_modules/.bin/esbuild dist/htmx-plot.js --minify --outfile=dist/htmx-plot.min.js

install:
	pnpm install

update:
	pnpm update @observablehq/plot
	$(MAKE) build

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
