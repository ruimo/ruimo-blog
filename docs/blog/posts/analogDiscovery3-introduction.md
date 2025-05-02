---
date: 2025-05-02 01:00:00
comments: true
image: https://f.media-amazon.com/images/I/515ardNwW4L._SL1000_.jpg
categories:
  - Analog Discovery 3
---

# Analog Discovery 3

![Analog Discovery 3](https://f.media-amazon.com/images/I/515ardNwW4L._SL1000_.jpg)

Analog Discovery 3を買ってみた。日本でも購入可能だが、最近少し円高に振れているので[本家](https://digilent.com/shop/analog-discovery-3/)で購入した。一緒に[BNC Adapter](https://digilent.com/shop/bnc-adapter-for-analog-discovery/)と[Impedance Analyzer](https://digilent.com/shop/impedance-analyzer-for-analog-discovery/)も購入。FedExなので数日で届いた。FedExの送料は$10ほど(昔は$20以上した記憶なのだが、最近安くなったのだろうか)。

## セットアップ

[サポートページ](https://digilent.com/shop/out-of-the-box-solutions/)に従ってソフトウェアを導入する。WaveFormsというのとDAQamiというのがあるようだ。これ以外にも有償のものがある模様。今回はWaveFormsを使うことにする。

[Downloadページ](https://lp.digilent.com/complete-adept-runtime-download)に行き、家のマシンはLubuntu 24.04なので、AMD64用のdebパッケージを入手。インストールを試みるも早速謎のエラー。

    sudo apt install ./digilent.waveforms_3.24.2_amd64.deb
    [sudo] shanai のパスワード:
    パッケージリストを読み込んでいます... 完了
    依存関係ツリーを作成しています... 完了
    状態情報を読み取っています... 完了
    注意、'./digilent.waveforms_3.24.2_amd64.deb' の代わりに 'digilent.waveforms' を選択します
    インストールすることができないパッケージがありました。おそらく、あり得
    ない状況を要求したか、(不安定版ディストリビューションを使用しているの
    であれば) 必要なパッケージがまだ作成されていなかったり Incoming から移
    動されていないことが考えられます。
    以下の情報がこの問題を解決するために役立つかもしれません:
    
    以下のパッケージには満たせない依存関係があります:
     digilent.waveforms : 依存: digilent.adept.runtime (>= 2.27.9) しかし、インストールすることができません
    E: 問題を解決することができません。壊れた変更禁止パッケージがあります。

```digilent.adept.runtime```というパッケージが必要みたいだが自動ではインストールされないらしい。このモジュールは[別のページ](https://lp.digilent.com/complete-adept-runtime-download)にあるので、これを先にインストールすること、WaveFormsもインストールできた。

[Analog Discovery 3記事一覧](/ruimo-blog/blog/category/analog-discovery-3)
