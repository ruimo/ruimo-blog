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
      '  <div id="ss-caption"></div>',
      '  <div id="ss-counter"></div>',
      '  <button id="ss-next" title="次の画像">&#10095;</button>',
      '</div>',
    ].join('');
    document.body.appendChild(modal);

    document.getElementById('ss-overlay').addEventListener('click', closeSlideshow);
    document.getElementById('ss-close').addEventListener('click', closeSlideshow);
    document.getElementById('ss-prev').addEventListener('click', function () { move(-1); resetTimer(); });
    document.getElementById('ss-next').addEventListener('click', function () { move(1);  resetTimer(); });
    // 画像クリックで次へ
    document.getElementById('ss-img').addEventListener('click', function () { move(1); resetTimer(); });

    document.addEventListener('keydown', function (e) {
      if (!document.getElementById('ss-modal').classList.contains('ss-open')) return;
      if (e.key === 'ArrowLeft')  { move(-1); resetTimer(); }
      if (e.key === 'ArrowRight') { move(1);  resetTimer(); }
      if (e.key === 'Escape')     closeSlideshow();
    });
  }

  var images = [];   // { src, alt }
  var current = 0;
  var autoTimer = null;

  function resetTimer() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { move(1); resetTimer(); }, 5000);
  }

  // ページ内の全 data-slideshow 画像を収集
  function collectImages() {
    images = [];
    document.querySelectorAll('img[data-slideshow]').forEach(function (img) {
      images.push({ src: img.getAttribute('data-slideshow'), alt: img.getAttribute('data-alt') || img.alt || '' });
    });
  }

  function show(index) {
    current = (index + images.length) % images.length;
    var ssImg = document.getElementById('ss-img');
    ssImg.src = images[current].src;
    ssImg.alt = images[current].alt;
    document.getElementById('ss-caption').textContent = images[current].alt;
    document.getElementById('ss-counter').textContent = (current + 1) + ' / ' + images.length;
    // 前後ボタンの表示制御
    document.getElementById('ss-prev').style.visibility = images.length > 1 ? 'visible' : 'hidden';
    document.getElementById('ss-next').style.visibility = images.length > 1 ? 'visible' : 'hidden';
  }

  function move(dir) {
    show(current + dir);
  }

  function closeSlideshow() {
    clearTimeout(autoTimer);
    autoTimer = null;
    document.getElementById('ss-modal').classList.remove('ss-open');
    document.getElementById('ss-img').src = '';
  }

  // グローバルに公開（clickable_img.html の onclick から呼ぶ）
  window.openSlideshow = function (triggerImg) {
    ensureModal();
    collectImages();
    if (images.length === 0) return;
    var src = triggerImg.getAttribute('data-slideshow') || triggerImg.src;
    var idx = images.findIndex(function (im) { return im.src === src; });
    show(idx >= 0 ? idx : 0);
    document.getElementById('ss-modal').classList.add('ss-open');
    resetTimer();
  };
})();
