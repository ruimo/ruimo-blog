+++
date ="2025-12-28"
title = "深度合成(フォーカススタッキング)"
[extra]
og_image = "/blog/focusStack/ogp.jpg"
+++

一眼カメラは撮像素子が大きいので、ボケた写真を撮るのに向いている。逆に全体にピントを合わせた写真を撮るのは苦手だ。

{{ clickable_img(src="image001.jpg", alt="image001") }}

この写真は手前にピントを合わせているが、奥の方はボケている。

これに対する伝統的な解決方法の1つはティルトレンズだ。

<a href="https://global.canon/ja/c-museum/product/ef298.html">
<img src="https://global.canon/ja/c-museum/wp-content/uploads/2015/05/ef298_b.jpg">
</a>

真ん中のダイヤルを回すとレンズを曲げることができる。写真は[LENS-CAMERA](https://www.lens-camera.com/product/canon-ts-e-45mm-f-2-8-tilt-shift-lens/)から。

![tilted](tilted.jpg)

このサイズの被写体だと90mmくらいが欲しいところなのだが、うちには17mmと45mmしかない。高いレンズなのでおいそれと買えないのだ。45mmで撮ってトリミングした。

{{ clickable_img(src="tilt.jpg", alt="tilt") }}

こんな感じで全体にピントの合った写真が撮れる。

もう1つの方法は、深度合成(フォーカススタッキング)だ。ピントの位置を変えながら何枚も写真を撮っておき、これをデジタル合成する方法だ。α7Vはフォーカスブラケット機能があるので、自動でピント位置を変えながら複数枚の写真を撮ってくれる。これは一番奥にピントを合わせたもの。

{{ clickable_img(src="image999.jpg", alt="image999") }}

こんな感じでピント位置を少しずつずらしながら34枚の写真を撮って、合成した。アプリは[shinestacker](https://github.com/lucalista/shinestacker)を使用した。出来た合成写真がこちら。

{{ clickable_img(src="stack.jpg", alt="stack") }}

合成時間は数分だった。深度合成の利点は、レンズを自由に選べることだが、動く被写体では無理なのと、時として不自然になることもある。またレンズにはフォーカスブリージングという現象があって、ピントの位置によって画角が微妙に変わてしまうものがある。なので深度合成する時はフォーカスブリージングの少ないレンズを選ぶ必要がある。

