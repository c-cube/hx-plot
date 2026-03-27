build: install dist/htmx-plot.js dist/htmx-plot.min.js

dist/htmx-plot.js: src/htmx-plot.js node_modules/@observablehq/plot
	mkdir -p dist
	node_modules/.bin/esbuild src/htmx-plot.js --bundle --format=iife --outfile=dist/htmx-plot.js

dist/htmx-plot.min.js: dist/htmx-plot.js
	node_modules/.bin/esbuild dist/htmx-plot.js --minify --outfile=dist/htmx-plot.min.js

install:
	pnpm install

update:
	pnpm update @observablehq/plot
	$(MAKE) build

lint:
	pnpm exec biome lint src/htmx-plot.js

serve: dist/htmx-plot.js
	python3 demo/server.py
