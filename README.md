
[Blog site](https://ruimo.github.io/ruimo-blog/)

## ローカルプレビュー

Zola **0.23.6** と Node.js / npm（`npx`）を使用します。

```sh
./run.sh
```

ブラウザで <http://localhost:2000/> を開きます。検索インデックスは
Pagefind で生成され、記事の変更時にも更新されます。

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
