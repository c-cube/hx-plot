build: install dist/hx-plot.min.js dist/hx-plot.full.min.js

ESBUILD ?= node_modules/.pnpm/@esbuild+linux-x64@0.27.4/node_modules/@esbuild/linux-x64/bin/esbuild
BIOME   ?= node_modules/.pnpm/@biomejs+cli-linux-x64@2.4.9/node_modules/@biomejs/cli-linux-x64/biome

dist/hx-plot.min.js: src/hx-plot.js src/hx-plot.core.js node_modules/vega
	mkdir -p dist
	$(ESBUILD) src/hx-plot.js --bundle --format=iife --minify --outfile=dist/hx-plot.min.js

dist/hx-plot.full.min.js: src/hx-plot.full.js src/hx-plot.core.js node_modules/vega
	mkdir -p dist
	$(ESBUILD) src/hx-plot.full.js --bundle --format=iife --minify --outfile=dist/hx-plot.full.min.js

PNPM ?= pnpm

install:
	$(PNPM) install

# Fast path: skip install if node_modules already present
build-fast: dist/hx-plot.min.js dist/hx-plot.full.min.js

update:
	$(PNPM) update vega vega-lite
	$(MAKE) build

clean:
	rm -rf dist

test:
	npx playwright test

lint:
	$(BIOME) lint src/

serve: dist/hx-plot.min.js
	python3 demo/server.py
