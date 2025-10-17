/**
 * @file sw.js
 * @description Service Worker - オフライン対応とキャッシュ管理
 * @since 1.0.0
 */

// キャッシュバージョン - 更新時にインクリメントする
const CACHE_VERSION = 'v1.2.1';
const CACHE_NAME = `presentation-timer-${CACHE_VERSION}`;

// ベースパスを検出（開発環境: '/', 本番環境: '/presentation-timer/'）
const BASE_PATH = self.location.pathname.includes('/presentation-timer/')
  ? '/presentation-timer'
  : '';

// キャッシュするリソース一覧
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/css/main.css`,
  `${BASE_PATH}/css/responsive.css`,
  `${BASE_PATH}/js/app.js`,
  `${BASE_PATH}/js/models/TimerState.js`,
  `${BASE_PATH}/js/models/TimerConfig.js`,
  `${BASE_PATH}/js/models/AlertConfig.js`,
  `${BASE_PATH}/js/models/SoundType.js`,
  `${BASE_PATH}/js/services/TimerService.js`,
  `${BASE_PATH}/js/services/StorageService.js`,
  `${BASE_PATH}/js/services/AudioService.js`,
  `${BASE_PATH}/js/ui/TimerDisplay.js`,
  `${BASE_PATH}/js/ui/ControlPanel.js`,
  `${BASE_PATH}/js/ui/SettingsPanel.js`,
  `${BASE_PATH}/assets/sounds/bell.mp3`,
  `${BASE_PATH}/assets/sounds/gong.mp3`,
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
 * HTMLファイル: Network-First戦略（常に最新版を取得、失敗時のみキャッシュ）
 * その他のアセット: Cache-First戦略（キャッシュを優先、なければネットワーク）
 */
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isHTMLRequest =
    url.pathname.endsWith('.html') ||
    url.pathname === `${BASE_PATH}/` ||
    url.pathname === '/' ||
    url.pathname === BASE_PATH;

  if (isHTMLRequest) {
    // HTMLファイルはNetwork-First戦略
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // ネットワークから取得成功
          console.log('[Service Worker] Network-First: Fetched from network:', event.request.url);

          // レスポンスが有効な場合はキャッシュに保存
          if (response && response.status === 200 && response.type !== 'error') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          // ネットワーク取得失敗（オフライン時）
          console.log(
            '[Service Worker] Network-First: Network failed, using cache:',
            event.request.url
          );

          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // HTMLのキャッシュがない場合はindex.htmlにフォールバック
            return caches.match(`${BASE_PATH}/index.html`);
          });
        })
    );
  } else {
    // その他のアセット（CSS、JS、画像、音声）はCache-First戦略
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Cache-First: Cache hit:', event.request.url);
            return cachedResponse;
          }

          console.log(
            '[Service Worker] Cache-First: Cache miss, fetching from network:',
            event.request.url
          );

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
              return caches.match(event.request);
            });
        })
        .catch((error) => {
          console.error('[Service Worker] Cache match failed:', error);
          return fetch(event.request);
        })
    );
  }
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
