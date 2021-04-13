'use strict';

const CACHE_NAME = 'static-cache-v2';
const FILES_TO_CACHE = [
	'index.html',
	'app.js',
	'manifest.json',
	'style.css',
	'script.js',
	'rsa-utils/jsbn_1.js',
	'rsa-utils/jsbn_2.js',
	'rsa-utils/prng4.js',
	'rsa-utils/rng.js',
	'rsa-utils/rsa.js'
];

// Install service worker and cache all content
self.addEventListener('install', e => e.waitUntil(
	caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE))));

// Fetch content from cache if available for 
// offline support and cache new resources if available
self.addEventListener('fetch', e => e.respondWith(
	caches.match(e.request).then((r) => {
		return r || fetch(e.request).then((res) => {
			return caches.open(CACHE_NAME).then((cache) => {
				cache.put(e.request, res.clone());
				return res;
			})
		})
	})
));

// Clean up old caches
self.addEventListener('activate', e => e.waitUntil(
	caches.keys().then((keyList) => {
		return Promise.all(keyList.map((key) => {
			if (CACHE_NAME.indexOf(key) === -1) {
				return caches.delete(key);
			}
		}));
	})
));
