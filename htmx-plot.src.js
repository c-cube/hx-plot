(function () {

  // Convert a plain JSON mark descriptor { type, data, ...opts } into a
  // Plot mark instance. If it's already a mark instance, return it as-is.
  function toMark(mark) {
    if (typeof mark !== 'object' || mark === null || typeof mark.type !== 'string') {
      return mark; // already a mark instance
    }
    var fn = Plot[mark.type];
    if (typeof fn !== 'function') {
      throw new Error('[htmx-plot] unknown mark type: ' + mark.type);
    }
    var opts = Object.assign({}, mark);
    var data = opts.data !== undefined ? opts.data : [];
    delete opts.type;
    delete opts.data;
    return fn(data, opts);
  }

  function renderPlot(json) {
    var opts = Object.assign({}, json);
    if (Array.isArray(opts.marks)) opts.marks = opts.marks.map(toMark);
    return Plot.plot(opts).outerHTML;
  }

  htmx.defineExtension('plot', {

    // hx-get case: htmx fetches the URL, we intercept the JSON response and
    // return SVG outerHTML so htmx swaps it into hx-target normally.
    transformResponse: function (text, xhr, elt) {
      try {
        return renderPlot(JSON.parse(text));
      } catch (e) {
        console.error('[htmx-plot]', e);
        return text;
      }
    },

    // hx-plot="#selector" case: on htmx:load, find elements with hx-plot,
    // read JSON from the referenced element, render into hx-target.
    onEvent: function (name, evt) {
      if (name !== 'htmx:load') return;
      var root = evt.detail.elt;
      var elts = [];
      if (root.matches && root.matches('[hx-ext~="plot"][hx-plot]')) elts.push(root);
      if (root.querySelectorAll) root.querySelectorAll('[hx-ext~="plot"][hx-plot]').forEach(function (e) { elts.push(e); });
      elts.forEach(function (elt) {
        var selector = elt.getAttribute('hx-plot');
        var src = document.querySelector(selector);
        if (!src) { console.error('[htmx-plot] element not found:', selector); return; }
        try {
          var t = elt.getAttribute('hx-target');
          var target = (t && t !== 'this') ? document.querySelector(t) : elt;
          target.innerHTML = renderPlot(JSON.parse(src.textContent));
        } catch (e) {
          console.error('[htmx-plot]', e);
        }
      });
    }
  });
})();
