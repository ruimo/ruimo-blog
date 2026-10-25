
[Blog site](https://ruimo.github.io/ruimo-blog/)

## ローカルプレビュー

Zola **0.23.6** と Node.js / npm（`npx`）を使用します。

```sh
./run.sh
```

ブラウザで <http://localhost:2000/> を開きます。検索インデックスは
Pagefind で生成され、記事の変更時にも更新されます。

iPhoneなど同じLANの別端末から確認する場合は、PCのLAN IPを指定して起動します。
既に起動しているプレビューはCtrl+Cで停止してから実行してください。

```sh
BASE_URL=http://192.168.0.201:2000 ./run.sh
```

別端末からも同じURLを開きます。IPが変わった場合は指定し直してください。
`BASE_URL`は生成するCSS・JavaScript・記事リンクのURLにも使われます。

## VITURE / SpaceWalkerでのスライドショー

iPhoneのSpaceWalker内蔵ブラウザで記事を開き、アプリのツールバーで
「Fullscreen」を選んでから画像の「スライドショー」を押します。
アプリ設定の「Fullscreen」を有効にして、新しい画面を最初から全画面にすることもできます。
画像は縦横比を保ったまま表示領域に収まり、縦横比の違いによる黒帯は残ります。

ブログ側の「全画面」ボタンはブラウザのFullscreen APIを使用します。
非対応・許可されない環境ではメッセージを表示し、スライドショーは継続します。
グラスの接続検出やSpaceWalker自体の全画面切り替えは行いません。
実機では画像送り、秒数変更、縦横表示、閉じる操作を確認してください。

Zola 0.23 以降はショートコードではなく Tera コンポーネントを使います。
定義は `templates/components/` にあります。

```jinja2
{{ <r2_clickable_img src="photo.jpg" alt="写真" page={page} config={config} /> }}

{% <note> %}
注記の本文（Markdown が使えます）。
{% </note> %}
```

記事に Tera / Jinja のコード例を書く場合は、その部分を
`{% raw %}` と `{% endraw %}` で囲み、テンプレートとしての評価を防ぎます。
