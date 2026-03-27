import * as Plot from '@observablehq/plot';

const SELECTOR = '[hx-ext~="plot"][hx-plot]';

function toMark(mark) {
  if (typeof mark !== 'object' || mark === null || typeof mark.type !== 'string') {
    return mark;
  }
  const { type, data, ...opts } = mark;
  const fn = Plot[type];
  if (typeof fn !== 'function') throw new Error('[htmx-plot] unknown mark type: ' + type);
  return fn(data ?? [], opts);
}

function renderPlot(json) {
  const marks = Array.isArray(json.marks) ? json.marks.map(toMark) : json.marks;
  return Plot.plot({ ...json, marks }).outerHTML;
}

htmx.defineExtension('plot', {
  transformResponse: function (text, xhr, elt) {
    try {
      return renderPlot(JSON.parse(text));
    } catch (e) {
      console.error('[htmx-plot]', e);
      return text;
    }
  },

  onEvent: function (name, evt) {
    if (name !== 'htmx:load') return;
    const root = evt.detail.elt;
    const elts = [
      ...(root.matches?.(SELECTOR) ? [root] : []),
      ...root.querySelectorAll(SELECTOR),
    ];
    for (const elt of elts) {
      const selector = elt.getAttribute('hx-plot');
      const src = document.querySelector(selector);
      if (!src) { console.error('[htmx-plot] element not found:', selector); continue; }
      try {
        const t = elt.getAttribute('hx-target');
        const target = (t && t !== 'this') ? document.querySelector(t) : elt;
        target.innerHTML = renderPlot(JSON.parse(src.textContent));
      } catch (e) {
        console.error('[htmx-plot]', e);
      }
    }
  }
});
