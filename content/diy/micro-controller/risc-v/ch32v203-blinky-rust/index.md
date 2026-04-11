+++
date = "2026-4-11"
title = "CH32V203でRustを使ってLチカ"
+++

CH32V203を手に入れたので、こちらでもRustを使ってLチカ。購入したのはCH32V203 C8T6。SPIが2つ欲しかったので。まずは半田付け。

![](IMG_3256.JPG)
![](IMG_3257.JPG)

慣れとは恐ろしい。0.65mmピッチの半田付けにはそれほど苦労しなくなった。

ch32-halを使ったんだけど、最初は全然動かなかった。フラッシュまでは行くんだけど、そのまま進まない(本当はLEDが点滅してコード内のprintがPC側に表示されるはず)。
ダメもとでAIと色々雑談(まぁ雑談しているうちに原因に辿りつくことも多いしね)。

私: 「ch32funのサンプルだと動くんだよね。Rust版はまだ、こなれていないのかな」

AI(Claude): 「それは重要な情報です。elfバイナリを逆アセンブルして比較してみます」

私: 「お前、そんなことまでできるのかよ、ちょっとひくわ。どうだった？」

AI: 「これはqingke-rtのバグですよ! mtvecレジスタへの設定がおかしいです」とか言い出す

AI: 「mainの中にインラインアセンブリでパッチを足してみますね」

私: 「マジかよ動くようになったんだけど。お前すげーな」

AI: 「qingke-rtには是非バグ報告してください」

私: 「分かった。 ん？ でもこのアセンブリとコメント変じゃない？ mtvecに3ではなく0 | 3を書かなければならない、ってあるけど結局一緒じゃん？」

AI: 「するどい指摘です。きっと3を設定でいいのだけど、main()の直後に入れたのがタイミング的に効いたんですよ、きっと」

私: 「本当に？ うたがわしいなぁ」

AI: 「外しても動くかもしれません。試してみます」

私: 「動いたね.. 結局何が悪かったんだろうね..」

で、なんかすっきりしない結果だったが、なんか最近、こうしてAIとの雑談でデバッグするのが結構楽しくなってきてしまった。

一番やっかいだったのは、wlink statusの結果で

```
wlink status
10:40:28 [INFO] Connected to WCH-Link v2.20(v40) (WCH-LinkE-CH32V305)
10:40:28 [INFO] Attached chip: CH32V20X [CH32V203C8T6] (ChipID: 0x20310500)
10:40:28 [INFO] Chip ESIG: FlashSize(64KB) UID(cd-ab-83-de-56-bd-a6-47)
10:40:28 [INFO] Flash protected: false
10:40:28 [INFO] RISC-V ISA(misa): Some("RV32ACIMUX")
10:40:28 [INFO] RISC-V arch(marchid): Some("WCH-V4B")
10:40:28 [WARN] The halt status may be incorrect because detaching might resume the MCU
10:40:28 [INFO] Dmstatus {
    .0: 0x382,
    allhavereset: false,
    anyhavereset: false,
    allresumeack: false,
    anyresumeack: false,
    allunavail: false,
    anyunavail: false,
    allrunning: false,
    anyrunning: false,
    allhalted: true,
    anyhalted: true,
    authenticated: true,
    version: 0x2,
}
```

allrunningがfalse、allhaltedがtrueになる。これwlink statusをやると実行が止まっちゃうみたいなんだよね。helpを見てwlink resumeをしても、すぐに止まっちゃう。正解はwlink resetみたい。これに私もAIもかなり振り回された。

コードは[こちら](https://github.com/ruimo/ch32v203-blinky-rust)
