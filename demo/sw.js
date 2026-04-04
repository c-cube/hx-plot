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
        try {
          JSON.parse(body); // validate
          stored = body;
          return new Response(null, { status: 204 });
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }
      }),
    );
    return;
  }

  if (e.request.method === 'GET') {
    if (stored === null) {
      e.respondWith(new Response('No spec stored yet', { status: 404 }));
    } else {
      e.respondWith(new Response(stored, {
        headers: { 'Content-Type': 'application/json' },
      }));
    }
    return;
  }
});
