---
date: 2025-05-01
comments: true
---

# MkDocsでBlog

これまでのBlogは家のサーバで動かしていたのだが、そろそろGitHub Pagesで何とかできないものかと思っていた。静的コンテンツの配信だけなら何も問題無いのだが、それ以外にも以下が欲しい。

- コメント機能
- RSS配信
- OGP機能
- Blog以外のコンテンツも一緒に置きたい

色々と調べてみたところ、pluginを入れれば何とかなりそうなので移行してみた。

## Material Plugin

まずは[Material Plugin](https://squidfunk.github.io/mkdocs-material/plugins/blog/)。mkdocsはpipでインストールしておき、以下を実行。

    mkdir blog
    mkdocs new blog

こんな感じのディレクトリ構成になる。

    .
    ├─ docs/
    │  └─ blog/
    │     ├─ posts/
    │     └─ index.md
    └─ mkdocs.yml

まずは、こんな感じのmkdocs.yml

    plugins:
      - blog
          blog_dir: blog
    theme:
      name: material
      features:
        - navigation.indexes
    nav:
      - ...
      - Blog:
        - blog/index.md

あとはpostsの下に記事を書くと勝手に拾い上げてくれる。docs/blog/postsの下にhello-world.mdを作る。

    ---
    draft: true 
    date: 2024-01-31 
    categories:
      - Hello
      - World
    ---

    # Hello world!

## Blog以外のコンテンツを置く

docs/others.mdを作り以下のようにすると見える

    nav:
      - Blog:
        - blog/index.md
      - others.md

## テンプレート

docs/templatesを作って、mkdocs.ymlで以下のように指定する。

    theme:
      name: 'material'
      custom_dir: 'docs/templates'

この下にblog-post.htmlを作っておく。とりあえず[公式のもの](https://github.com/squidfunk/mkdocs-material/blob/master/src/templates/blog-post.html)を拝借。

## コメント

[Giscusを使ったコメント機能がある](https://squidfunk.github.io/mkdocs-material/setup/adding-a-comment-system/)

コメントはGitHubアカウントが必要なので、これによってコメント荒しの予防になるようだ。

まず[Giscus](https://github.com/apps/giscus)をGitHubにインストール。

Blogを格納するレポジトリをGitHubに作る。今回はhttps://github.com/ruimo/ruimo-blog

SettingsでFeaturesでDiscussionsをチェックして、Set up discussionsをクリック

[Giscus](https://giscus.app/ja#repository)のページに行き、レポジトリを設定(ruimo/ruimo-blog)

カテゴリにAnnouncementsを選択。

「giscusを有効にする」にあるsnippetをコピーする。内容はこんな感じのもの。

    <script src="https://giscus.app/client.js"
            data-repo="ruimo/ruimo-blog"
    ...
            data-lang="ja"
            crossorigin="anonymous"
            async>
    </script>

docs/templates/partials/comments.htmlを作る。この時、```  <!-- Insert generated snippet here -->```の部分に上記のsnippetをペーストする

    {% if page.meta.comments %}
      <h2 id="__comments">{{ lang.t("meta.comments") }}</h2>
    <script src="https://giscus.app/client.js"
            data-repo="ruimo/ruimo-blog"
    ...
            data-lang="ja"
            crossorigin="anonymous"
            async>
    </script>
    
      <!-- Synchronize Giscus theme with palette -->
      <script>
        var giscus = document.querySelector("script[src*=giscus]")
    
        // Set palette on initial load
        var palette = __md_get("__palette")
        if (palette && typeof palette.color === "object") {
          var theme = palette.color.scheme === "slate"
            ? "transparent_dark"
            : "light"
    
          // Instruct Giscus to set theme
          giscus.setAttribute("data-theme", theme) 
        }
    
        // Register event handlers after documented loaded
        document.addEventListener("DOMContentLoaded", function() {
          var ref = document.querySelector("[data-md-component=palette]")
          ref.addEventListener("change", function() {
            var palette = __md_get("__palette")
            if (palette && typeof palette.color === "object") {
              var theme = palette.color.scheme === "slate"
                ? "transparent_dark"
                : "light"
    
              // Instruct Giscus to change theme
              var frame = document.querySelector(".giscus-frame")
              frame.contentWindow.postMessage(
                { giscus: { setConfig: { theme } } },
                "https://giscus.app"
              )
            }
          })
        })
      </script>
    {% endif %}

これでコメント入力欄が付く。

## RSS

pluginがあるのでmkdocsに以下のように指定するだけ。

    plugins:
      - blog
      - rss:
          abstract_chars_count: 160  # 概要の文字数
          date_from_meta:
            as_creation: date        # 作成日としてmeta情報の'date'を使用
            as_update: lastmod       # 更新日としてmeta情報の'lastmod'を使用
          image: https://example.com/image.png  # デフォルトアイキャッチ画像
          categories:
            - categories
            - tags
          comments_path: "#__comments"  # コメントセクションへのリンク（オプション）
          use_directory_url: true

## OGP

pluginがあるものの、どうもうまく動かなかったのでテンプレートで作ってしまった。docs/templates/main.htmlを作る(生成AIに聞きながらコピペしただけなので、細かいところ間違っているかも)。

    {% extends "base.html" %}
    
    {% block extrahead %}
      {{ super() }}
      {% if page and page.meta and page.meta.image %}
        {% set image_path = page.meta.image %}
        
        {# URLからblogディレクトリだけを抽出 #}
        {% set content_type = page.url.split('/')[0] if page.url.split('/')[0] else '' %}
        
        {# 画像パスから不要な相対パス表記（./）を削除 #}
        {% set clean_image_path = image_path | replace('./', '') %}
        
        {% if not image_path.startswith('/') and not image_path.startswith('http') %}
          <meta property="og:image" content="{{ config.site_url }}{{ content_type }}/{{ clean_image_path }}" />
          <meta name="twitter:image" content="{{ config.site_url }}{{ content_type }}/{{ clean_image_path }}" />
        {% else %}
          {# 絶対パスまたはHTTPで始まる完全なURLの場合はそのまま使用 #}
          <meta property="og:image" content="{% if image_path.startswith('/') %}{{ config.site_url | replace('/', '', 1) }}{% endif %}{{ image_path }}" />
          <meta name="twitter:image" content="{% if image_path.startswith('/') %}{{ config.site_url | replace('/', '', 1) }}{% endif %}{{ image_path }}" />
        {% endif %}
      {% else %}
        <meta property="og:image" content="{{ config.site_url }}assets/images/default-ogp.png" />
        <meta name="twitter:image" content="{{ config.site_url }}assets/images/default-ogp.png" />
      {% endif %}
      <meta property="og:title" content="{% if page.title %}{{ page.title }}{% else %}{{ config.site_name }}{% endif %}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    {% endblock %}

あとは記事の中で以下のようにimage:を付ければ、それをOGPとして拾ってくれる。外部イメージならこのようにURLで、内部画像ならパスを書けば良い。

    ---
    date: 2025-04-30
    comments: true
    image: https://ae-pic-a1.aliexpress-media.com/kf/S5b498f7963384bc3bcaa21c100f2a8faS.jpg_220x220q75.jpg_.avif
    ---

## GitHub Pagesに載せる

自分はGitHub Actionsでやった。このあたりは記事が沢山あるし生成AIに聞けば詳しく教えてくれる。.github/workflows/build.ymlを作成

    name: ci 
    on:
      push:
        branches:
          - main
    permissions:
      contents: write
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
          - name: Configure Git Credentials
            run: |
              git config user.name github-actions-bot
              git config user.email github-actions-bot@users.noreply.github.com
          - name: gh-deploy
            run: |
              git fetch
              git branch -a
              ./prepare.sh
              ./deploy.sh

中で使っているprepare.sh:

    #!/bin/sh
    docker build -t ruimo/mkdocs .

Dockerfile:

    FROM squidfunk/mkdocs-material
    RUN pip install python-markdown-math

deploy.sh:

    #!/bin/sh
    export U_ID=$(id -u)
    export G_ID=$(id -g)
    docker run -i --rm \
        -p 8040:8040 \
        --user $U_ID:$G_ID \
        --workdir="/var/home" \
        --env HOME="/var/home" \
        --volume="$PWD:/var/home" \
        --volume="/etc/group:/etc/group:ro" \
        --volume="/etc/passwd:/etc/passwd:ro" \
        --volume="/etc/shadow:/etc/shadow:ro" ruimo/mkdocs gh-deploy

[全てのファイルはこちら](https://github.com/ruimo/ruimo-blog)

拡張機能として、数式を書けるようにするやつとかdark mode用の設定とかを入れてある。
