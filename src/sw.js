workbox.setConfig({
  debug: true
});

workbox.core.setCacheNameDetails({prefix: "app"});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


//Перезагузка всех окон для отображения новых данных
self.addEventListener('message', (event) => {
  if (event.data.action === 'SKIP_WAITING') {
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
  if (event.request.method === 'GET') {
    return;
  }
  
  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      self.registration.showNotification("Данные сохранены для отправки при появлении сети!");
      await queue.pushRequest({request: event.request});
      return error;
    }
  };

  event.respondWith(bgSyncLogic());
});

self.addEventListener('sync', function(event) {
  self.registration.showNotification("Данные отправлены! Обновите страницу.");
  setTimeout(event.waitUntil(updateCandidate()), 10000);
});

async function updateCandidate(){
  console.log("updateCandidate");
  const response = await fetch('http://localhost:3000/candidates');
  const cacheC = await caches.open('app-candidates');
  cacheC.put(response.url, response)
}

//periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'ruir-bgsync') {
    console.log('Fetching ruir in the background!');
    event.waitUntil(updateRuirs());
  }
});

async function updateRuirs() {
  try{
    const response = await fetch('http://localhost:3000/ruirs');
    const ruirsCache = await caches.open('ruirs');
    ruirsCache.put(response.url, response);
    self.registration.showNotification("Записи РУИР синхронизированы!")
  }
  catch{
    console.log("Нет сети для синхронизациии РУИР")
  }
  
};
workbox.routing.registerRoute(
  "http://localhost:3000/ruirs",
  new workbox.strategies.CacheFirst({
    cacheName: "ruirs"
  })
);


self.addEventListener('push', (event) => {
  self.registration.showNotification("Hello from the Service Worker!");
});

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  event.waitUntil(clients.matchAll({
      type: 'window'
  }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == 'http://localhost:4000/' && 'focus' in client)
              return client.focus();
      }
      if (clients.openWindow)
          return clients.openWindow('/');
  }));
});


// let click_open_url;
// self.addEventListener("push", function(event){
//     let pushMessage = event.data.text();
//     click_open_url = "google.com";
//     const options = {
//         body: pushMessage.body, 
//     };
//     self.registration.showNotification("Pwa app notification", options)
// });

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


