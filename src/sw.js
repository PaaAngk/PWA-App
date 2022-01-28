workbox.setConfig({
  debug: false
});

//Префикс для кэша 
workbox.core.setCacheNameDetails({prefix: "app"});

//Кэширования файлов для работы приложения офлайн 
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

//skipWaiting всех окон для обновления SW
self.addEventListener('message', (event) => {
  if (event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

//Регистрация маршрутизации кандидатов
workbox.routing.registerRoute(
  "http://localhost:3000/candidates",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "app-candidates",
    plugins: [
      new workbox.broadcastUpdate.Plugin()
    ],
  })
);

//Queue ипользуется для хранения провалившихся запросов. Такие запросы записываются в IndexedDB и извлекаются(отправляются) из нее при восстановлении соединения. 
const queue = new workbox.backgroundSync.Queue('QueuePWA') 

//Слушатель события отправления данных на сервер. Для перехвата запроса
self.addEventListener('fetch', (event) => {
  //Просмотр запроса добавления кандидата и проверка присутствия его в РИУР. Если запись нашлась, то сохраняется в локальном хранилище РИУР
  if (event.request.url === 'http://localhost:3000/candidates' && event.request.method === 'POST') {
    let clonedBody = event.request.clone().json();//Копирование запроса для работы с ним
    clonedBody.then((result) => {
      obj = JSON.parse(JSON.stringify(result));
      
      //Попытка получение записи из РИУР по всем реквизитам кроме места жительства, в случае успешного получения - кэширование его
      fetch(`http://localhost:3000/riurs?secondName=${obj.secondName}&firstName=${obj.firstName}&lastName=${obj.lastName}&DOB=${obj.DOB}&placeBirth=${obj.placeBirth}`)
      .then(async response => {
        let data = await response.json();
        //console.log(data);
        if (data.length !== 0) {
            const channel = new BroadcastChannel('sw-messages');
            channel.postMessage({title: 'updateRiur', body: data});
        }  
      });
    });
  }

  //Просмотр запроса изменения кандидата и проверка присутствия его в РИУР. Если запись нашлась, то сохраняется в локальном хранилище РИУР
  if (event.request.url.match('http:\/\/localhost:3000\/candidates\/.+') && event.request.method === 'PUT') {
    let clonedBody = event.request.clone().json();//Копирование запроса для работы с ним
    clonedBody.then((result) => {
      obj = JSON.parse(JSON.stringify(result));
      
      //Попытка получение записи из РИУР по всем реквизитам кроме места жительства, в случае успешного получения - кэширование его
      fetch(`http://localhost:3000/riurs?secondName=${obj.secondName}&firstName=${obj.firstName}&lastName=${obj.lastName}&DOB=${obj.DOB}&placeBirth=${obj.placeBirth}`)
      .then(async response => {
        let data = await response.json();
        //console.log(data);
        if (data.length !== 0) {
            const channel = new BroadcastChannel('sw-messages');
            channel.postMessage({title: 'updateRiur', body: data});
        }
      });
    });
  }

  //Получение данных Мобильный избиратель из кэше, при наличии, в обратном случае - выполняется запрос на сервер
  if (event.request.url === 'http://localhost:3000/mobileVoter') {
    event.respondWith(async function() {
      const cache = await caches.open('mobileVoter');
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      const networkResponse = await fetch(event.request);
      return networkResponse;
    }());  
  }
  
  //Пропуск GET запроса
  if (event.request.method === 'GET') {
    return;
  }

  //Попытка передачи данных. При отсутствие связи - сохранение в IndexedDB и вывод уведомления
  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      self.registration.showNotification("Данные сохранены для отправки при появлении сети!");
      //Добавление запроса в промежуточный буфер для отправки при появление сети
      await queue.pushRequest({request: event.request});
      return error;
    }
  };

  //Обещание вернуть ответ запроса и вызов функции фоновой синхронизации 
  event.respondWith(bgSyncLogic());
});

//Слушатель события синхронизации, отсылаемого браузером при появление интернета. Показ уведомление об успешной передачи данных и обновление кандидатов
self.addEventListener('sync', function(event) {
  self.registration.showNotification("Данные отправлены!");
  event.waitUntil(updateCandidate());
});

//Обновление закэшированного списка кандидатов 
async function updateCandidate(){
  const response = await fetch('http://localhost:3000/candidates');
  //Открытие кэша и добавление запроса в кэш
  const cacheC = await caches.open('app-candidates');
  cacheC.put(response.url, response)
}


//Слушатель события периодического обновления, вызывающий метод получения данных Мобильный избиратель
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mobileVoter-bgsync') {
    console.log('Fetching mobile voter in the background!');
    event.waitUntil(updateMobileVoter());
  }
});

//Метод получения и сохранения данных Мобильный избиратель
async function updateMobileVoter() {
  try{
    const response = await fetch('http://localhost:3000/mobileVoter');

    //Открытие кэша и добавление запроса в кэш
    const MVCache = await caches.open('mobileVoter');
    MVCache.put(response.url, response);
    self.registration.showNotification("Записи мобильный избиратель синхронизированы!")
    //BroadcastChannel для передачи данных на клиента с целью их сохранения
    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage({title: 'MV'});
  }
  catch{
    console.log(error);
    self.registration.showNotification("Нет сети для загрузки мобильный избиратель!")
  }
  
};

//Слушатель события нажатия на уведомление для открытия той страницы с которой пришло уведомления
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
