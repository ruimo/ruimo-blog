---
comments: true
---

# バーコード生成

## 概要

JavaScript による，Barcode 作成ツールです．EAN13, EAN8, UPC-A, UPC-E, NW-7, CODE-39 に対応しています．作成後そのまま印刷できます．

## 使い方

使い方は至って簡単．ページを読み込むと「結果ウィンドウ」が表示されます．作成したバーコードはこの結果ウィンドウに表示されていきます．ページにコードと，コードタイプ，商品名を入力して下さい．最後のサイズは，作成するバーコードの大きさを指定します．入力が終わったら，「データ追加」ボタンを押してください．結果ウィンドウにバーコードが追加されます．プリンターの解像度が低い場合は大き目に作成して縮小コピーすると良いでしょう．また Fax 等で送る場合も大き目に印刷して送ったほうが良いでしょう．結果ウィンドウの中身を消したい場合は，「データ全消去」ボタンを押してください．

[使ってみる](https://www.ruimo.com/static/tools/genBar/genBar.html)

## ローカルで使用する

ページをダウンロードしておけば，ローカルでも実行できます．以下の3つ のファイルをダウンロード(ナビゲータなら，右クリックしてSave Link As を 指定)してください．あとは，ダウンロードした場所のgenBar.htmlをブラウザー で開けば使用できます．

[genBar.html(genBar 本体)](https://www.ruimo.com/static/tools/genBar/genBar.html)

[black.gif(黒バー)](https://www.ruimo.com/static/tools/genBar/black.gif)

[white.gif(白バー)(https://www.ruimo.com/static/tools/genBar/white.gif)

## 謝辞

このページの作成には，以下のページを参考にさせていただきました．

[バーコード・ページ](http://www.barcode.co.jp/)

## 変更履歴

- Ver 1.02  
UPC-Eが正しく作成されないのを修正しました．

- Ver 1.03  
UPC-Eのチェックディジット計算にバグがありました．

- Ver 2.00  
EAN13 AddOn 5と、UPC-A AddOn 5に対応しました。EAN13 AddOn 5は、日本で雑誌のバーコードに使用される予定です。

- Ver 2.01  
ぜんぜんまともに動かなくなっていたのを修正。

- Ver 2.02  
UPC-Eで、先頭が1の場合に、正しくバーコードが作成出来ていなかったのを修正。

- Ver 3.00  
齋藤さんから、UPC-E AddOn5, EAN13 AddOn2, UPC-A AddOn2, UPC-E AddOn2の機能追加をいただきました
