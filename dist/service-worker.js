importScripts("/precache-manifest.9db584d7263443c087ca21b2b74ed665.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.setConfig({
  debug: true
});

workbox.core.setCacheNameDetails({prefix: "app"});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


//Перезагузка всех окон для отображения новых данных
self.addEventListener('message', (event) => {
  if (event.data.action === 'SKIP_WAITING') {
    console.log(event.data);
    self.skipWaiting();
  }
});


workbox.routing.registerRoute(
  "http://localhost:3000/candidates",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "app-candidates",
    plugins: [
      new workbox.broadcastUpdate.Plugin()
    ],
  })
);

//Такие запросы записываются в IndexedDB и извлекаются из нее при восстановлении соединения.
const queue = new workbox.backgroundSync.Queue('QueuePWA') // использоваться для хранения провалившихся запросов
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'POST') {
    return;
  }
  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      await queue.pushRequest({request: event.request});
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

self.addEventListener('sync', function(event) {
	//console.log("sync event", event);
  console.log("Данные отправлены!");
  event.waitUntil(updateCandidate()); // sending sync request
});

function updateCandidate(){
  const response = fetch('http://localhost:3000/candidates');
  const cache = caches.open('app-candidates');
  cache.put(response.url, response)
}



//periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'ruir-bgsync') {
    console.log('Fetching ruir in the background!');
    event.waitUntil(updateRuirs());
  }
});

async function updateRuirs() {
  const response = await fetch('http://localhost:3000/ruirs');
  //console.log(await response.json());
  const ruirsCache = await caches.open('ruirs');
  ruirsCache.put(response.url, response)
};

workbox.routing.registerRoute(
  "http://localhost:3000/ruirs",
  new workbox.strategies.CacheFirst({
    cacheName: "ruirs"
  })
);



let click_open_url;
self.addEventListener("push", function(event){
    let pushMessage = event.data.text();
    console.log(event);
    click_open_url = "google.com";
    const options = {
        body: pushMessage.body,
        icon: './img/android-chrome-192x192.png',
        icon: './img/android-chrome-512x512.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        tag: 'vibration-sample'
    };
    event.waitUntil(
        self.regestration.showNotification("Pwa app notification", options)
    );
});

// function showNotification() {
//   Notification.requestPermission(function(result) {
//     if (result === 'granted') {
//       navigator.serviceWorker.ready.then(function(registration) {
//         registration.showNotification('Vibration Sample', {
//           body: 'Buzz! Buzz!',
//           icon: '../images/touch/chrome-touch-icon-192x192.png',
//           vibrate: [200, 100, 200, 100, 200, 100, 200],
//           tag: 'vibration-sample'
//         });
//       });
//     }
//   });
// }


// self.addEventListener("notificationclick", function(event){
//     const clickedNot = event.showNotification;
//     clickedNot.close();
//     if(click_open_url){
//         const promiseChain = clients.openWindow(click_open_url);
//         event.waitUntil(promiseChain);
//     }
// });
