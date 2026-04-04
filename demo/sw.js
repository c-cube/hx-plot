// Service worker for hx-plot playground.
// Intercepts /demo/api/plot — stores JSON on POST, returns it on GET.
// Everything else is passed through to the network.

let stored = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname !== '/demo/api/plot') return; // pass through

  if (e.request.method === 'POST') {
    e.respondWith(
      e.request.text().then(body => {
        // Accept raw JSON or form-encoded (htmx posts textarea as name=value).
        const ct = e.request.headers.get('content-type') || '';
        if (ct.includes('application/x-www-form-urlencoded')) {
          body = new URLSearchParams(body).get('spec') ?? body;
        }
        try {
          JSON.parse(body);
          stored = body;
          return new Response(stored, {
            headers: { 'Content-Type': 'application/json' },
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
