const PREFIX = '[hx-plot]';
const INLINE_SELECTOR = '[hx-ext~="plot"][hx-plot]';
const PENDING_CLASS = 'hx-plot-pending';

let _loadDeps;
let _depsPromise = null;

function getDeps() {
  if (!_depsPromise) {
    log('deps: loading');
    _depsPromise = _loadDeps().then(deps => {
      log('deps: ready');
      return deps;
    }, err => {
      _depsPromise = null; // allow retry
      log('deps: failed —', err.message);
      throw err;
    });
  }
  return _depsPromise;
}

// Kick off dep loading eagerly so charts don't wait on first render.
export function prefetchDeps() {
  getDeps().catch(() => {});
}

// Dispatch a custom event on `target` for observability.
function emit(target, type, detail = {}) {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
}

function log(...args) {
  console.debug(PREFIX, ...args);
}

function containerLabel(el) {
  return el.id || el.getAttribute('data-plot-id') || el.tagName.toLowerCase();
}

async function renderSpec(spec, container) {
  log('render: start', containerLabel(container));
  emit(container, 'hx-plot:render-start', { spec });
  const { vega, vegaLite } = await getDeps();

  // Abort if the container was removed from the DOM while deps loaded.
  if (!container.isConnected) {
    log('render: aborted (detached)', containerLabel(container));
    return;
  }

  const compiled = vegaLite.compile(spec);
  const view = new vega.View(vega.parse(compiled.spec), {
    renderer: 'svg',
    container,
    hover: true,
  });
  await view.runAsync();
  log('render: done', containerLabel(container));
  emit(container, 'hx-plot:render-done', { spec });
}

async function renderPending(root) {
  const nodes = Array.from(root.querySelectorAll(`.${PENDING_CLASS}`));
  if (nodes.length) log('pending: found', nodes.length, 'in', root.id || root.className);
  for (const node of nodes) {
    // Remove class first so a concurrent swap doesn't double-render.
    node.classList.remove(PENDING_CLASS);
    try {
      const spec = JSON.parse(node.dataset.vl);
      await renderSpec(spec, node);
    } catch (e) {
      node.classList.add(PENDING_CLASS); // restore so retry is possible
      log('pending: render error —', e.message);
      console.error(PREFIX, e);
    }
  }
}

// Handle inline hx-plot elements on initial page load.
// Extension onEvent('htmx:load') is NOT reliable for elements that have no
// hx-get/hx-post, so we use a document-level htmx:load listener instead.
function initInline(root) {
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
    log('inline: rendering', selector, '→', t || '(self)');
    renderSpec(JSON.parse(src.textContent), target).catch(e => console.error(PREFIX, e));
  }
}

export function register(loadDeps) {
  _loadDeps = loadDeps;

  // Eagerly start loading deps as soon as the extension is registered.
  prefetchDeps();

  // Use document-level listeners for both htmx:load and htmx:afterSwap.
  // Extension onEvent() is only invoked for the element that initiated the
  // request, not for external targets — so it misses most render triggers.

  document.addEventListener('htmx:load', evt => {
    // Handles inline hx-plot specs and dynamically added hx-ext elements.
    initInline(evt.detail.elt);
  });

  document.addEventListener('htmx:afterSwap', evt => {
    // Render any pending divs swapped into the target.
    const root = evt.detail.target ?? evt.detail.elt;
    if (root) {
      log('afterSwap: checking for pending in', containerLabel(root));
      renderPending(root);
    }
  });

  htmx.defineExtension('plot', {
    transformResponse(text) {
      try {
        JSON.parse(text); // validate JSON
        const div = document.createElement('div');
        div.className = PENDING_CLASS;
        div.dataset.vl = text;
        log('transform: queued pending div');
        return div.outerHTML;
      } catch (e) {
        console.error(PREFIX, 'transformResponse: invalid JSON —', e.message);
        return text;
      }
    },
  });
}
