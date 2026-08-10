(function () {
  // モーダルHTML を body に1度だけ挿入
  function ensureModal() {
    if (document.getElementById('ss-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'ss-modal';
    modal.innerHTML = [
      '<div id="ss-overlay"></div>',
      '<div id="ss-box">',
      '  <button id="ss-close" title="閉じる">✕</button>',
      '  <button id="ss-prev" title="前の画像">&#10094;</button>',
      '  <img id="ss-img" src="" alt="">',
      '  <div id="ss-progress-wrap"><div id="ss-progress-bar"></div></div>',
      '  <div id="ss-caption"></div>',
      '  <div id="ss-footer">',
      '    <div id="ss-counter"></div>',
      '    <div id="ss-remaining"></div>',
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
    // 画像クリックで次へ
    document.getElementById('ss-img').addEventListener('click', function () { move(1); });
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
      var elapsed = Date.now() - setAt;
      var delay = Math.max(0, getInterval() - elapsed);
      startProgress(delay);
      startRemaining(delay);
      autoTimer = setTimeout(function () { move(1); }, delay);
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
    clearTimeout(autoTimer);
    clearInterval(remainTimer);
    autoTimer = null;
    remainTimer = null;
    stopProgress();
    stopRemaining();
    document.getElementById('ss-modal').classList.remove('ss-open');
    document.getElementById('ss-img').src = '';
  }

  // グローバルに公開（clickable_img.html の onclick から呼ぶ）
  window.openSlideshow = function (triggerImg) {
    ensureModal();
    // cookie から秒数を復元
    var el = document.getElementById('ss-interval');
    if (el) el.value = loadIntervalFromCookie();
    collectImages();
    if (images.length === 0) return;
    var src = triggerImg.getAttribute('data-slideshow') || triggerImg.src;
    var idx = images.findIndex(function (im) { return im.src === src; });
    show(idx >= 0 ? idx : 0);
    document.getElementById('ss-modal').classList.add('ss-open');
  };
})();
