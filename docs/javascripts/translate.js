// docs/javascripts/translate.js
document.addEventListener('DOMContentLoaded', function() {
    var e = document.getElementById('google_translate_element');
    while (e.firstChild) {
        e.removeChild(element.firstChild);
    }

    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
});

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'ja',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}
