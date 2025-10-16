/**
 * @file sw.js
 * @description Service Worker - オフライン対応とキャッシュ管理
 * @since 1.0.0
 */

// キャッシュバージョン - 更新時にインクリメントする
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `presentation-timer-${CACHE_VERSION}`;

// キャッシュするリソース一覧
const STATIC_ASSETS = [
  '/presentation-timer/',
  '/presentation-timer/index.html',
  '/presentation-timer/css/main.css',
  '/presentation-timer/css/responsive.css',
  '/presentation-timer/js/app.js',
  '/presentation-timer/js/models/TimerState.js',
  '/presentation-timer/js/models/TimerConfig.js',
  '/presentation-timer/js/models/AlertConfig.js',
  '/presentation-timer/js/models/SoundType.js',
  '/presentation-timer/js/services/TimerService.js',
  '/presentation-timer/js/services/StorageService.js',
  '/presentation-timer/js/services/AudioService.js',
  '/presentation-timer/js/ui/TimerDisplay.js',
  '/presentation-timer/js/ui/ControlPanel.js',
  '/presentation-timer/js/ui/SettingsPanel.js',
  '/presentation-timer/assets/sounds/bell.mp3',
  '/presentation-timer/assets/sounds/gong.mp3',
];

/**
 * Service Worker インストールイベント
 *
 * @description
 * Service Workerがインストールされる際に実行されます。
 * 静的アセットをキャッシュに追加します。
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        // 新しいService Workerを即座にアクティブ化
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

/**
 * Service Worker アクティベートイベント
 *
 * @description
 * Service Workerがアクティブになる際に実行されます。
 * 古いキャッシュを削除します。
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        // 即座にすべてのクライアントを制御下に置く
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

/**
 * Service Worker フェッチイベント
 *
 * @description
 * ネットワークリクエストをインターセプトします。
 * Cache-First戦略: キャッシュを優先し、なければネットワークから取得
 */
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Cache hit:', event.request.url);
          return cachedResponse;
        }

        console.log('[Service Worker] Cache miss, fetching from network:', event.request.url);

        // キャッシュになければネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効でない場合はそのまま返す
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            // オフライン時はキャッシュからフォールバック
            return caches.match('/presentation-timer/index.html');
          });
      })
      .catch((error) => {
        console.error('[Service Worker] Cache match failed:', error);
        return fetch(event.request);
      })
  );
});

/**
 * Service Worker メッセージイベント
 *
 * @description
 * クライアントからのメッセージを受信します。
 * SKIP_WAITING メッセージで即座にアクティブ化します。
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
