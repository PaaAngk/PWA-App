importScripts("/precache-manifest.f4bc8e96c590e970917aed07d3e4e4b1.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.setConfig({
  debug: true
});

workbox.core.setCacheNameDetails({prefix: "app"});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


//Перезагузка всех окон для отображения новых данных
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


workbox.routing.registerRoute(
  "http://localhost:3000/candidates",
  new workbox.strategies.StaleWhileRevalidate({//StaleWhileRevalidate постоянно требует обновления
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







// let click_open_url;
// self.addEventListener("push", function(event){
//     let pushMessage = event.data.text();

//     click_open_url = "google.com";
//     const options = {
//         body: pushMessage.body,
//         icon: './img/android-chrome-192x192.png',
//         icon: './img/android-chrome-512x512.png',
//         vibrate: [200, 100, 200, 100, 200, 100, 200],
//         tag: 'vibration-sample'
//     };
//     event.waitUntil(
//         self.regestration.showNotification("Pwa app notification", options)
//     );
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


// self.addEventListener("notificationclick", function(event){
//     const clickedNot = event.showNotification;
//     clickedNot.close();
//     if(click_open_url){
//         const promiseChain = clients.openWindow(click_open_url);
//         event.waitUntil(promiseChain);
//     }
// });
