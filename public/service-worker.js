/**
 * we have more control of cache and we can implement many strategies by service worker
 * https://web.dev/service-worker-caching-and-http-caching/
 *
 * the service worker is updated when browser detect changes, browser will compare byte by byte
 * https://web.dev/learn/pwa/update/#updating-the-service-worker
 *
 * Readme:
 * service worker life-cycle
 * - in _app is registered the service-worker
 * - the service worker is downloaded -> installed -> activated
 * - service worker is like a proxy (intercept requests)
 */

/**
 * if you want to force the update of service worker
 * increase the SERVICE_WORKER_VERSION
 * ex: when update the the web worker
 */
const SERVICE_WORKER_VERSION = "v1.0.1";
const CACHE_NAME = "v1-static-assets-cache";

const start = () => {
  self.skipWaiting();

  self.addEventListener("install", () => {
    console.log("service worker installed", SERVICE_WORKER_VERSION);
  });

  self.addEventListener("activate", event => {
    console.log("activatedx");
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        if (cache) {
          cache.delete("/_next/static/chunks/src_workers_MapWorker_ts.js");

          return cache.addAll(["/_next/static/chunks/src_workers_MapWorker_ts.js"]);
        }
      })
    );
  });

  self.addEventListener("fetch", event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          console.error("Fetch failed; returning offline page instead.");

          return new Response(null, { status: 503, statusText: "Service Unavailable" });
        });
      })
    );
  });
};

start();
