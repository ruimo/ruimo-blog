// docs/javascripts/translate.js
document.addEventListener('DOMContentLoaded', function() {
  // Google Translate要素がまだ存在しない場合のみ作成
  if (!document.getElementById('google_translate_element').hasChildNodes()) {
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }
});

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'ja',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}
