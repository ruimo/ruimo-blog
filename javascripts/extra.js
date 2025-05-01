document.addEventListener('DOMContentLoaded', function() {
    // サイト名の要素を取得
    const siteNameElements = [
        document.querySelector('.md-header__title .md-header__topic:first-child .md-ellipsis'),
        document.querySelector('.md-nav__title')
    ];
        
  
    for (let e of siteNameElements) {
        if (e) {
            // 現在のテキストを保存
            const text = e.textContent;
            
            // リンク要素を作成
            const link = document.createElement('a');
            link.href = '/';  // サイトのルートに移動
            link.textContent = text;
            link.style.color = 'inherit';
            link.style.textDecoration = 'none';
            
            // テキストをリンクに置き換え
            e.textContent = '';
            e.appendChild(link);
        }
    }
});
