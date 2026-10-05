const CACHE_NAME = "lava-jato-dan-v7";
const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./assets/icon-192.png",
    "./assets/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName =>
                        cacheName.startsWith("lava-jato-dan-") && cacheName !== CACHE_NAME
                    )
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put("./index.html", response.clone());
                    }
                    return response;
                } catch (error) {
                    const cachedResponse = await caches.match("./index.html");
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    throw error;
                }
            })()
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => cachedResponse || fetch(request))
    );
});
