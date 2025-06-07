+++
date ="2025-6-8"
title = "MkDocsからZolaに変更"
+++

以前、[MkdocsでBlog](../blog)で書いた通り、MkDocsにMaterial pluginを入れてBlogを作ってみたのだが、いかんせん実行が遅い。調べてみると[Zola](https://www.getzola.org/)というのが速そう。テンプレートエンジンに[Rustのtera](https://docs.rs/tera/latest/tera/)が使われているので、[MkDocsで使われているJinja](https://jinja.palletsprojects.com/en/stable/)とほぼ同じ感じで書ける。

MkDocsの場合はビルドに数秒かかったうちのサイト、Zolaだと50msだった。圧倒的速度差。[kita](https://www.getzola.org/themes/kita/)というテーマを入れるとコメント、RSS、OGPなど必要な機能がほぼ揃う。
