---
date: 2025-05-17 08:00:00
comments: true
categories:
  - Linux
---

この前、家のサーバを新調(といってもデスクトップのお下がり)した時、USBに接続したブラザーのレーザプリンタ(HL2240D)のCUPS経由による印刷だけうまくいかず、仕方なくデスクトップの方にプリンタをつないでいたのだけど、デスクトップを電源offするとスマホからの印刷ができなくて不便なので、今日ちゃんと調べてみた。

結論から言うと、[ブラザーのドライバ](https://support.brother.com/g/b/downloadhowto.aspx?c=as_ot&lang=en&prod=hl2240d_all&os=128&dlid=dlf006893_000&flang=4&type3=625)をインストールする時に、画面の表示内容を注意深く見ていると、以下のようなエラーが表示されていた。ここでエラーになってもインストーラがapt install --forceで無理やり突き進んでしまって、ちゃんとインストールできていなかったようだ。

    Package ia32-libs is not available, but is referred to by another package.
    This may mean that the package is missing, has been obsoleted, or
    is only available from another source
    However the following packages replace it:
      lib32z1
    
    E: Package 'ia32-libs' has no installation candidate

ということで、ドライバのインストール前に以下を実行したところ解消した。分かってみればなんとも単純な結果だ。

    sudo apt install lib32z1

このプリンターも、もう10年くらい使っているけどまだまだ使えて助かる。

トラブルシューティングで生成AIに色々聞いたが、結局そのものズバりな解答は出てこなかった(まぁ、マイナーな事象だろうしね)。ただCUPSのトラブルシューティングに使えるコマンドは色々教えてもらえたのでそれなりには役に立った。

今までCUPSとかIPPとか良く分からずに使っていたのだけど、元々CUPSはIPPをサポートした1実装という位置付けなのね。
