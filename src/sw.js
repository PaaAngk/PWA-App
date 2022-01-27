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
  if (event.request.url === 'http://localhost:3000/mobileVoter') {
    event.respondWith(async function() {
      const cache = await caches.open('mobileVoter');
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      const networkResponse = await fetch(event.request);
      /*event.waitUntil(
        cache.put(event.request, networkResponse.clone())
      );*/
      return networkResponse;
    }());  
  }
  
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
  self.registration.showNotification("Данные отправлены!");
  event.waitUntil(updateCandidate());
});

async function updateCandidate(){
  const response = await fetch('http://localhost:3000/candidates');
  const cacheC = await caches.open('app-candidates');
  cacheC.put(response.url, response)
}


//periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mobileVoter-bgsync') {
    console.log('Fetching mobile voter in the background!');
    event.waitUntil(updateMobileVoter());
  }
});

async function updateMobileVoter() {
  try{
    const response = await fetch('http://localhost:3000/mobileVoter');
    const MVCache = await caches.open('mobileVoter');
    MVCache.put(response.url, response);
    self.registration.showNotification("Записи мобильный избиратель синхронизированы!")

    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage({title: 'MV'});
  }
  catch{
    console.log(error);
    self.registration.showNotification("Нет сети для загрузки мобильный избиратель!")
  }
  
};




self.addEventListener('push', (event) => {
  self.registration.showNotification("Hello from the Service Worker!");
});

self.addEventListener('notificationclick', function (event) {
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


