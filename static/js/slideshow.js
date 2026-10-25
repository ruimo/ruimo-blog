(function () {
  // モーダルHTML を body に1度だけ挿入
  function ensureModal() {
    if (document.getElementById('ss-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'ss-modal';
    modal.innerHTML = [
      '<div id="ss-overlay"></div>',
      '<div id="ss-box">',
      '  <button id="ss-controls-show" type="button" title="操作を表示" aria-label="操作を表示">⋯</button>',
      '  <button id="ss-close" title="閉じる">✕</button>',
      '  <button id="ss-prev" title="前の画像">&#10094;</button>',
      '  <img id="ss-img" src="" alt="" title="クリックで一時停止／再開">',
      '  <div id="ss-progress-wrap"><div id="ss-progress-bar"></div></div>',
      '  <div id="ss-caption"></div>',
      '  <div id="ss-footer">',
      '    <div id="ss-counter"></div>',
      '    <div id="ss-remaining"></div>',
      '    <button id="ss-pause" type="button" aria-pressed="false">一時停止</button>',
      '    <button id="ss-controls-hide" type="button">操作を隠す</button>',
      '    <button id="ss-fullscreen" type="button">全画面</button>',
      '    <span id="ss-screen-status" role="status"></span>',
      '    <label id="ss-interval-label"><input id="ss-interval" type="number" min="1" max="99" value="5">秒</label>',
      '    <a id="ss-lens" href="#" target="_blank" rel="noopener nofollow" referrerpolicy="no-referrer" title="Google レンズでこの画像を検索">これは何？</a>',
      '  </div>',
      '  <button id="ss-next" title="次の画像">&#10095;</button>',
      '</div>',
    ].join('');
    document.body.appendChild(modal);

    document.getElementById('ss-overlay').addEventListener('click', closeSlideshow);
    document.getElementById('ss-close').addEventListener('click', closeSlideshow);
    document.getElementById('ss-prev').addEventListener('click', function () { move(-1); });
    document.getElementById('ss-next').addEventListener('click', function () { move(1);  });
    document.getElementById('ss-controls-hide').addEventListener('click', function () {
      modal.classList.add('ss-controls-hidden');
      positionProgress();
      document.getElementById('ss-controls-show').focus();
    });
    document.getElementById('ss-controls-show').addEventListener('click', function () {
      modal.classList.remove('ss-controls-hidden');
      positionProgress();
      document.getElementById('ss-controls-hide').focus();
    });
    window.addEventListener('resize', positionProgress);
    if (window.ResizeObserver) {
      new ResizeObserver(positionProgress).observe(document.getElementById('ss-img'));
    }
    // 操作非表示中は、最初のタップを操作の再表示だけに使う。
    modal.addEventListener('click', function (e) {
      if (!modal.classList.contains('ss-controls-hidden')) return;
      e.preventDefault();
      e.stopPropagation();
      modal.classList.remove('ss-controls-hidden');
      positionProgress();
      document.getElementById('ss-controls-hide').focus();
    }, true);
    document.getElementById('ss-fullscreen').addEventListener('click', function () {
      var request = modal.requestFullscreen || modal.webkitRequestFullscreen;
      if (!request) {
        document.getElementById('ss-screen-status').textContent = 'SpaceWalkerではアプリ側の全画面を使用してください';
        return;
      }
      try {
        Promise.resolve(request.call(modal)).catch(fullscreenFailed);
      } catch (e) {
        fullscreenFailed();
      }
    });
    // 画像クリックで自動送りを一時停止／再開
    document.getElementById('ss-img').addEventListener('click', togglePause);
    document.getElementById('ss-pause').addEventListener('click', togglePause);
    // 秒数変更時にcookieへ保存
    document.getElementById('ss-interval').addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (isNaN(v) || v < 1) { this.value = 5; v = 5; }
      saveIntervalToCookie(v);
    });
    // Google レンズを開くときは自動送りを止める（別タブで見比べられるように）
    document.getElementById('ss-lens').addEventListener('click', function (e) {
      e.stopPropagation();
      resetTimer();
      stopRemaining();
      setPaused(true);
    });

    document.addEventListener('keydown', function (e) {
      if (!document.getElementById('ss-modal').classList.contains('ss-open')) return;
      if (e.key === 'ArrowLeft')  { move(-1); }
      if (e.key === 'ArrowRight') { move(1);  }
      if (e.key === 'Escape')     closeSlideshow();
    });
  }

  var images = [];   // { src, alt, lens }
  var current = 0;
  var autoTimer = null;
  var remainTimer = null;  // 残り秒数更新用
  var paused = false;

  // object-fit: contain で描画される画像の外側の余白を比較する。
  function positionProgress() {
    var modal = document.getElementById('ss-modal');
    if (!modal || !modal.classList.contains('ss-open')) return;
    var img = document.getElementById('ss-img');
    if (!img.naturalWidth || !img.naturalHeight) return;
    var rect = document.getElementById('ss-box').getBoundingClientRect();
    if (!modal.classList.contains('ss-controls-hidden')) rect = img.getBoundingClientRect();
    var scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    var gapX = Math.max(0, (rect.width - img.naturalWidth * scale) / 2);
    var gapY = Math.max(0, (rect.height - img.naturalHeight * scale) / 2);
    var vertical = gapX > gapY;
    modal.classList.toggle('ss-progress-vertical', vertical);
    // 余白の中央に配置。余白がない場合は画面端に重ねる。
    modal.style.setProperty('--ss-progress-offset', Math.max(2, (vertical ? gapX : gapY) / 2) + 'px');
    modal.style.setProperty('--ss-progress-length', rect.height * 0.9 + 'px');
  }

  function setPaused(value) {
    paused = value;
    var button = document.getElementById('ss-pause');
    button.textContent = paused ? '再開' : '一時停止';
    button.setAttribute('aria-pressed', String(paused));
  }

  function scheduleAdvance(delay) {
    if (paused) return;
    startProgress(delay);
    startRemaining(delay);
    autoTimer = setTimeout(function () { move(1); }, delay);
  }

  function togglePause() {
    resetTimer();
    stopRemaining();
    setPaused(!paused);
    // 再開時は設定された秒数を最初から数える。
    if (!paused) {
      var img = document.getElementById('ss-img');
      if (img.complete && img.naturalWidth > 0) scheduleAdvance(getInterval());
    }
  }

  function fullscreenFailed() {
    document.getElementById('ss-screen-status').textContent = '全画面にできませんでした。アプリ側の全画面をお試しください';
  }

  // Google レンズ用URL。テンプレートが付与した data-lens を優先し、
  // 無ければ現在のページを基準に絶対URL化して組み立てる
  function lensUrlFor(im) {
    if (im.lens) return im.lens;
    var abs;
    try {
      abs = new URL(im.src, document.baseURI).href;
    } catch (e) {
      return '';
    }
    return 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(abs);
  }

  var COOKIE_KEY = 'ss_interval';

  function saveIntervalToCookie(sec) {
    var expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = COOKIE_KEY + '=' + sec + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function loadIntervalFromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)ss_interval=(\d+)/);
    return m ? parseInt(m[1], 10) : 5;
  }

  function getInterval() {
    var el = document.getElementById('ss-interval');
    var v = el ? parseInt(el.value, 10) : 5;
    return (isNaN(v) || v < 1 ? 5 : v) * 1000;
  }

  function resetTimer() {
    clearTimeout(autoTimer);
    clearInterval(remainTimer);
    autoTimer = null;
    remainTimer = null;
    stopProgress();
  }

  function startProgress(durationMs) {
    var bar = document.getElementById('ss-progress-bar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    // 強制リフロー
    bar.offsetWidth; // eslint-disable-line no-unused-expressions
    bar.style.transition = 'width ' + durationMs + 'ms linear';
    bar.style.width = '100%';
  }

  function stopProgress() {
    var bar = document.getElementById('ss-progress-bar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
  }

  function startRemaining(durationMs) {
    var el = document.getElementById('ss-remaining');
    if (!el) return;
    var endsAt = Date.now() + durationMs;
    function tick() {
      var left = Math.ceil((endsAt - Date.now()) / 1000);
      el.textContent = left > 0 ? left + '秒' : '';
    }
    tick();
    remainTimer = setInterval(tick, 500);
  }

  function stopRemaining() {
    clearInterval(remainTimer);
    remainTimer = null;
    var el = document.getElementById('ss-remaining');
    if (el) el.textContent = '';
  }

  // ページ内の全 data-slideshow 画像を収集
  function collectImages() {
    images = [];
    document.querySelectorAll('img[data-slideshow]').forEach(function (img) {
      images.push({
        src: img.getAttribute('data-slideshow'),
        alt: img.getAttribute('data-alt') || img.alt || '',
        lens: img.getAttribute('data-lens') || ''
      });
    });
  }

  function show(index) {
    current = (index + images.length) % images.length;
    var ssImg = document.getElementById('ss-img');
    clearTimeout(autoTimer);
    autoTimer = null;
    ssImg.onload = null;
    var setAt = Date.now();
    ssImg.onload = function () {
      positionProgress();
      var elapsed = Date.now() - setAt;
      var delay = Math.max(0, getInterval() - elapsed);
      scheduleAdvance(delay);
    };
    ssImg.src = images[current].src;
    ssImg.alt = images[current].alt;
    document.getElementById('ss-caption').textContent = images[current].alt;
    document.getElementById('ss-counter').textContent = (current + 1) + ' / ' + images.length;
    var lens = document.getElementById('ss-lens');
    if (lens) {
      var url = lensUrlFor(images[current]);
      if (url) {
        lens.href = url;
        lens.style.display = '';
      } else {
        lens.style.display = 'none';
      }
    }
    // 前後ボタンの表示制御
    document.getElementById('ss-prev').style.visibility = images.length > 1 ? 'visible' : 'hidden';
    document.getElementById('ss-next').style.visibility = images.length > 1 ? 'visible' : 'hidden';
  }

  function move(dir) {
    resetTimer();
    show(current + dir);
  }

  function closeSlideshow() {
    var modal = document.getElementById('ss-modal');
    if ((document.fullscreenElement || document.webkitFullscreenElement) === modal) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        try { Promise.resolve(exit.call(document)).catch(function () {}); } catch (e) {}
      }
    }
    clearTimeout(autoTimer);
    clearInterval(remainTimer);
    autoTimer = null;
    remainTimer = null;
    stopProgress();
    stopRemaining();
    document.getElementById('ss-modal').classList.remove('ss-open');
    document.getElementById('ss-img').src = '';
    document.getElementById('ss-img').onload = null;
    document.body.classList.remove('ss-active');
  }

  // グローバルに公開（clickable_img.html の onclick から呼ぶ）
  window.openSlideshow = function (triggerImg) {
    ensureModal();
    // cookie から秒数を復元
    var el = document.getElementById('ss-interval');
    if (el) el.value = loadIntervalFromCookie();
    collectImages();
    if (images.length === 0) return;
    setPaused(false);
    var src = triggerImg.getAttribute('data-slideshow') || triggerImg.src;
    var idx = images.findIndex(function (im) { return im.src === src; });
    show(idx >= 0 ? idx : 0);
    document.getElementById('ss-modal').classList.add('ss-open');
    document.getElementById('ss-modal').classList.remove('ss-controls-hidden');
    positionProgress();
    document.getElementById('ss-screen-status').textContent = '';
    document.body.classList.add('ss-active');
  };
})();
