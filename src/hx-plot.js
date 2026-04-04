import { register } from './hx-plot.core.js';

const VEGA_CDN     = 'https://cdn.jsdelivr.net/npm/vega@6/build/vega.min.js';
const VEGALITE_CDN = 'https://cdn.jsdelivr.net/npm/vega-lite@6/build/vega-lite.min.js';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`[hx-plot] failed to load ${url}`));
    document.head.appendChild(s);
  });
}

register(async () => {
  await loadScript(VEGA_CDN);
  await loadScript(VEGALITE_CDN);
  return { vega: globalThis.vega, vegaLite: globalThis.vegaLite };
});
