const PREFIX = '[hx-plot]';
const INLINE_SELECTOR = '[hx-ext~="plot"][hx-plot]';
const PENDING_CLASS = 'hx-plot-pending';

let _loadDeps;
let _depsPromise = null;

function getDeps() {
  if (!_depsPromise) _depsPromise = _loadDeps();
  return _depsPromise;
}

async function renderSpec(spec, container) {
  const { vega, vegaLite } = await getDeps();
  const view = new vega.View(vega.parse(vegaLite.compile(spec).spec), {
    renderer: 'svg',
    container,
    hover: true,
  });
  await view.runAsync();
}

async function renderPending(root) {
  for (const node of root.querySelectorAll(`.${PENDING_CLASS}`)) {
    try {
      const spec = JSON.parse(node.dataset.vl);
      node.classList.remove(PENDING_CLASS);
      await renderSpec(spec, node);
    } catch (e) {
      console.error(PREFIX, e);
    }
  }
}

export function register(loadDeps) {
  _loadDeps = loadDeps;

  htmx.defineExtension('plot', {
    transformResponse(text) {
      try {
        JSON.parse(text); // validate
        const div = document.createElement('div');
        div.className = PENDING_CLASS;
        div.dataset.vl = text;
        return div.outerHTML;
      } catch (e) {
        console.error(PREFIX, e);
        return text;
      }
    },

    onEvent(name, evt) {
      if (name === 'htmx:afterSwap') {
        const root = evt.detail.target ?? evt.detail.elt;
        if (root) renderPending(root);
        return;
      }

      if (name !== 'htmx:load') return;
      const root = evt.detail.elt;
      const elts = [
        ...(root.matches?.(INLINE_SELECTOR) ? [root] : []),
        ...root.querySelectorAll(INLINE_SELECTOR),
      ];
      for (const elt of elts) {
        const selector = elt.getAttribute('hx-plot');
        const src = document.querySelector(selector);
        if (!src) { console.error(PREFIX, 'element not found:', selector); continue; }
        const t = elt.getAttribute('hx-target');
        const target = (t && t !== 'this') ? document.querySelector(t) : elt;
        if (!target) { console.error(PREFIX, 'target not found:', t); continue; }
        try {
          renderSpec(JSON.parse(src.textContent), target).catch(e => console.error(PREFIX, e));
        } catch (e) {
          console.error(PREFIX, e);
        }
      }
    },
  });
}
