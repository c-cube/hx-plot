const PREFIX = '[hx-plot]';
const INLINE_SELECTOR = '[hx-ext~="plot"][hx-plot]';
const PENDING_CLASS = 'hx-plot-pending';

let _loadDeps;
let _depsPromise = null;

function getDeps() {
  if (!_depsPromise) {
    log('deps: loading');
    _depsPromise = _loadDeps().then(
      deps => { log('deps: ready'); return deps; },
      err  => { _depsPromise = null; log('deps: failed —', err.message); throw err; },
    );
  }
  return _depsPromise;
}

function emit(target, type, detail = {}) {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
}

function error(target, e, extra = {}, swapOnError = false) {
  console.error(PREFIX, e);
  emit(target, 'hx-plot:error', { error: e, ...extra });
  if (swapOnError && target && target !== document) {
    const div = document.createElement('div');
    div.className = 'hx-plot-error';
    div.textContent = e.message ?? String(e);
    target.replaceChildren(div);
  }
}

function log(...args) {
  console.debug(PREFIX, ...args);
}

async function renderSpec(spec, container, swapOnError = false) {
  const label = container.id || container.tagName.toLowerCase();
  log('render: start', label);
  emit(container, 'hx-plot:render-start', { spec });
  const { vega, vegaLite } = await getDeps();
  if (!container.isConnected) { log('render: aborted (detached)', label); return; }
  try {
    await new vega.View(vega.parse(vegaLite.compile(spec).spec), {
      renderer: 'svg', container, hover: true,
    }).runAsync();
  } catch (e) {
    error(container, e, { spec }, swapOnError);
    return;
  }
  log('render: done', label);
  emit(container, 'hx-plot:render-done', { spec });
}

async function renderPending(root) {
  const nodes = Array.from(root.querySelectorAll(`.${PENDING_CLASS}`));
  if (nodes.length) log('pending: found', nodes.length, 'in', root.id || root.tagName);
  for (const node of nodes) {
    node.classList.remove(PENDING_CLASS);
    const swapOnError = node.dataset.swapOnError === 'true';
    let spec;
    try { spec = JSON.parse(node.dataset.vl); } catch (e) { error(node, e, {}, swapOnError); continue; }
    renderSpec(spec, node, swapOnError).catch(e => error(node, e, { spec }, swapOnError));
  }
}

// htmx:load fires for every element htmx processes, including the document
// body on init — so this catches both initial inline specs and dynamically
// added hx-ext elements.
function initInline(root) {
  const elts = root.matches?.(INLINE_SELECTOR) ? [root] : [];
  elts.push(...root.querySelectorAll(INLINE_SELECTOR));
  for (const elt of elts) {
    const swapOnError = elt.hasAttribute('hx-swap-on-error');
    const selector = elt.getAttribute('hx-plot');
    const src = document.querySelector(selector);
    if (!src) { console.error(PREFIX, 'element not found:', selector); continue; }
    const t = elt.getAttribute('hx-target');
    const target = (t && t !== 'this') ? document.querySelector(t) : elt;
    if (!target) { console.error(PREFIX, 'target not found:', t); continue; }
    log('inline: rendering', selector, '\u2192', t || '(self)');
    let spec;
    try { spec = JSON.parse(src.textContent); } catch (e) { error(target, e, {}, swapOnError); continue; }
    renderSpec(spec, target, swapOnError).catch(e => error(target, e, { spec }, swapOnError));
  }
}

export function register(loadDeps) {
  _loadDeps = loadDeps;
  getDeps().catch(() => {}); // prefetch

  // document-level listeners: extension onEvent() only fires for the
  // initiating element, missing external targets and static elements.
  document.addEventListener('htmx:load', evt => initInline(evt.detail.elt));
  document.addEventListener('htmx:afterSwap', evt => {
    const root = evt.detail.target ?? evt.detail.elt;
    if (root) { log('afterSwap:', root.id || root.tagName); renderPending(root); }
  });

  htmx.defineExtension('plot', {
    transformResponse(text, _xhr, elt) {
      try {
        JSON.parse(text);
        const div = document.createElement('div');
        div.className = PENDING_CLASS;
        div.dataset.vl = text;
        div.dataset.swapOnError = elt.hasAttribute('hx-swap-on-error') ? 'true' : '';
        return div.outerHTML;
      } catch (e) {
        error(document, e);
        return text;
      }
    },
  });
}
