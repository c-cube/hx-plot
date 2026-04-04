// Service worker for hx-plot playground.
// Intercepts /demo/api/plot — stores JSON on POST, returns it on GET.
// Everything else is passed through to the network.

let stored = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname === '/api/sine') {
    const t = Date.now() / 1000;
    const values = Array.from({ length: 64 }, (_, i) => ({
      x: parseFloat((i * 0.1).toFixed(2)),
      y: parseFloat((Math.sin(i * 0.2 + t)).toFixed(4)),
    }));
    const spec = JSON.stringify({
      mark: 'line',
      data: { values },
      encoding: {
        x: { field: 'x', type: 'quantitative', axis: { title: null } },
        y: { field: 'y', type: 'quantitative', scale: { domain: [-1.2, 1.2] } },
      },
      height: 150,
      width: 'container',
    });
    e.respondWith(new Response(spec, { headers: { 'Content-Type': 'application/json' } }));
    return;
  }

  if (url.pathname !== '/api/plot') return; // pass through

  if (e.request.method === 'POST') {
    e.respondWith(
      e.request.text().then(body => {
        // htmx posts textarea as form-urlencoded (name=value).
        const ct = e.request.headers.get('content-type') || '';
        if (ct.includes('application/x-www-form-urlencoded')) {
          body = new URLSearchParams(body).get('spec') ?? body;
        }
        try {
          JSON.parse(body);
          stored = body;
          return new Response(null, {
            status: 204,
            headers: { 'HX-Trigger': 'plotReady' },
          });
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }
      }),
    );
    return;
  }

  if (e.request.method === 'GET') {
    e.respondWith(stored === null
      ? new Response('No spec stored yet', { status: 404 })
      : new Response(stored, { headers: { 'Content-Type': 'application/json' } }),
    );
    return;
  }
});
