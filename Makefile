build: install dist/htmx-plot.js dist/htmx-plot.min.js

dist/htmx-plot.js: htmx-plot.src.js
	mkdir -p dist
	cp htmx-plot.src.js dist/htmx-plot.js

dist/htmx-plot.min.js: htmx-plot.src.js
	mkdir -p dist
	node_modules/.bin/esbuild htmx-plot.src.js --minify --outfile=dist/htmx-plot.min.js

install:
	pnpm install

update:
	@set -e; \
	VER=$$(curl -sf https://registry.npmjs.org/@observablehq/plot/latest \
	  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(JSON.parse(d).version))"); \
	URL=https://cdn.jsdelivr.net/npm/@observablehq/plot@$${VER}/dist/plot.umd.min.js; \
	HASH=sha384-$$(curl -sf "$$URL" | openssl dgst -sha384 -binary | openssl base64 -A); \
	sed -i "s|.*<!-- plot-cdn -->|  <script src=\"$$URL\" integrity=\"$$HASH\" crossorigin=\"anonymous\"></script> <!-- plot-cdn -->|" demo/demo.html; \
	echo "Updated @observablehq/plot to $$VER"

lint:
	pnpm exec biome lint htmx-plot.src.js

serve:
	python3 -m http.server 8000 --directory .
