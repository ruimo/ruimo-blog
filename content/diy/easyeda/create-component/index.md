+++
date ="2026-01-02"
title = "EasyEDAで自分用にコンポーネントを作り、3Dモデルも登録してケースも3Dプリント可能にする"
[extra]
og_image = "/diy/easyeda/create-component/ogp.jpg"
+++

JLCPCBとの連携が便利なので、最近はもっぱらEasyEDAを回路設計と基板設計に使用している。EasyEDAに自分が使いたい部品が全て登録されていれば良いが、そうでない場合は自分で登録する必要がある。

例えば、こういうRCAのピンジャックを使いたいとする。これは[aitendoで扱っている基板取り付けタイプのRCAジャック](https://www.aitendo.com/product/16785)だ。

<a href="https://www.aitendo.com/product/16785">
<img src="https://www.aitendo.com/data/aitendo/product/20180311_225e83.png">
</a>

ひとまず掲載されている型番「AV2-8.4-10GA」で検索してみる。見つからなければ、最後の-10GAなどを外してみる。

![search](search-component.png)

一番下のAV2-8.4-12 Doubleというのが近そうなので、とりあえずPlaceボタンで配置してみる。適当に結線して、

![schematics](schematics.png)

Updateする。

![update-design](update-design.png)

PCB画面になるので適当に配置してみる。

![pcb](pcb.png)

残念ながらPCB上の穴配置は、aitendoにあるものと異なることが分かる。

![dim](dim.png)

また3D viewを確認すると、3Dモデルが無いことも分かる。

![3d](3d.png)

3Dモデルがあれば、ケースを3Dプリントする時に基板の3Dモデルを使って穴位置を簡単に合わせられるが、無いとなると自分で穴開けしないといけない。この手の基板取り付けタイプは基板位置の決定と穴位置の決定を同時にやらないといけないため、面倒だし微妙にズレたりして残念な気持になる。

こういう場合は、まずは他に良い部品が無いか探すことになるが、この手のパーツはなかなか代替になるものが見つからない場合も多い。その場合の選択肢の1つが自分でコンポーネントを登録する方法だ。ここではその方法を紹介する。

EasyEDAのViewからBottom-Side Panelにチェックが入っていなかったら入れる。

![bottom-menu](bottom-menu.png)

下側にLibraryというタブがあるので選択し、Personalを選んでからAddボタンをクリックする。

![add-component](add-component.png)

ダイアログが表示されたら名前を付けて、Manage Categoriesを選ぶ(なんか、typoでGategoriesになっているが気にしないw)

![new-component](new-component.png)

+をクリックして、名前をJackとする。

![jack](jack.png)

Secondary CategoryにRCAを追加しよう。

![category](category.png)

Confirmボタンで保存する。1つ前のダイアログに戻るので、Categoryの...をクリックして、上で作ったJack→RCAを選択して、Confirmをクリック。

![select-category](select-category.png)

![select-category2](select-category2.png)

Saveする。DescriptionにURLを入れておくと便利だろう。

![save-component](save-component.png)

まず回路図上のシンボルを作るが、原点を意識しておこう。あまり変な位置に配置するとEasyEDAに警告を受ける。

![origin](origin.png)

まずPinを選んで4つ配置する。

![pins](pins.png)

ピンに名前を付ける。

![pins2](pins2.png)

Rectを使って、外枠を書いておこう。

![rect](rect.png)

次に基板側(PCB)を作る。同様に下のPanelでタブからFootprintを選んでAddをクリックする。

![footprint](footprint.png)

コンポーネントをAddした時と全く同じ手順で名前とカテゴリを設定してFootprintを作る。

![add-footprint](add-footprint.png)

今回も原点を意識する。

![pcb-origin](pcb-origin.png)

図面を確認しておく。この寸法の長方形を書こう。

![dim2](dim2.png)

長方形はシルクスクリーン(銅箔ではなく、基板上の印刷)にするので、この黄色のところに鉛筆マークが表示されるよう1回クリックする。

![silk](silk.png)

ここが分かりにくいんだけど、Polylineのアイコンの中にあるRectangleを選ぶ、その左にあるアイコンは銅箔を作るやつなので間違えないように。

![silk2](silk2.png)

頂点の1つをクリック、マウスを適当に移動してからもう一度クリックで長方形が出来るので、右側のところで座標を合わせると良い。

![dim3](dim3.png)

今回のパーツは、mm単位なので、1mm x 1mmでsnapを設定しておくと作業しやすい。

![snap](snap.png)

ViewメニューのGridも0.1mmにしておく(この2つの設定の関係が良く分からず..)。結局のところPropertyに数値を入れて合わせるので、実はgrid/snapは無くてもあまり関係無かったりする。

![grid](grid.png)

ジャック部分は図面を見ると14mm離れており部品全体の幅は27mmなので、(27-14)/2 = 6.5mm分端から離れた場所が中心になる。長さは7.6mm。長方形を書いてやり、分かりやすいように、R, Lの文字も入れておく。

![silk3](silk3.png)

まずGNDのpadを置く。

![gnd](gnd.png)

図面を見ながら座標を入れていけば良い。穴径は1.5mmなので、少し余裕をみてHoleのDiameterは1.7mmにし、それに合わせて外側のDiameterは2.5mmにしておいた。次にセンターピン用のpadを置く。

センターピンは、2.5x1.5とあるので、余裕をみて2.7x1.7の長方形のpadを作る。これはAND素子のマークのアイコンを使う(なぜAND素子なのかは不明w)。既に部品のあるところだと、snapが混乱する場合があるので、何も無いところで2.7x1.7.mmの長方形の4点を順番にクリックで指定していき、最後に起点をもう一度クリックすると四角いpadができる。位置合わせは右のPropertyで合わせれば良い。LayerがMulti-Layerになっていることに注意(こうしないとJLCPCBに発注した時に穴があかない)。

![r](r.png)

同じようにしてL側も作る。X方向に14mmずらすだけなので簡単だろう。コピー、ペーストして14mmずらせば良い。あと、回路図側のピン番号と合わせておく(PropertyのNumber)。

![pin-num](pin-num.png)

固定用の穴があるので、そこも開けておく。穴はslot regionというアイコンを使用する(マウスカーソルをホバーするとSlot Regionと表示されるアイコン)。

![slot](slot.png)

サイズは、3mmと、(25.5-22.8)/2 = 1.35mm なので余裕を見て3.2mm x 1.7mmにしておく(1.35mmの方は、爪があって引っかける感じなので、少し余裕を多めに見た)。

![slot2](slot2.png)

slotは真っ黒なのでちょっと分かりにくいの注意。定規のアイコンを使うと長さを測定できるので確認し、Saveしておく。
次に作ったfootprintをコンポーネントに設定する。下のパネルでDeviceタブを選び、Personal、Jack→RCAを選ぶと見つかるので、

![setfootprint](setfootprint.png)

右クリックしてEdit deviceを選ぶ。

![editdevice](editdevice.png) 

Footprintのところの...をクリック。

![changefootprint](changefootprint.png)

Personalから、Jack→RCAを選ぶと作ったFootprintが見つかるのでクリックしてConfirm。コンポーネントの画面に戻ったらSaveする。

実際にこのコンポーネントを使ってみよう。適当に回路図に配置してやる。回路図エディタでICマークを選んで、PersonalからCategoryでJack→RCAを選べば表示されるので、Placeで配置する。

![test](test.png)

footprintが設定されているはずだがされていなかったら...を押して設定してやる。そうしたら、Designの一番上のメニューでPCBをUpdateする。

![updatepcb](updatepcb.png)

これまで通り、Auto routeしてみて問題無く配線されることを確認する。

![test2](test2.png)

3Dアイコンでチェックする。

![3dcheck](3dcheck.png)

ちゃんと穴もあいているので良さそう。

ここまで出来れば、基板の発注までは大丈夫。

3Dモデルも登録すると、この基板を格納するケースを簡単に3Dプリントできるようになる。最後にこの3Dモデルの登録を紹介する。

私は普段、Linuxでも動くということでFreeCADを使って3Dモデルを作成しているが、なかなか操作が難しく、今回のような造形を0から設計するのは大変そうだ。ダメもとでAIにモデル作成を頼んでみる。最近評判の良いGeminiは、普段は高速モードで使いつつ、ここはという状況で思考モードを使うことで、課金無しでも結構使えて便利だ。

![ai](ai.png)

するとFreeCAD形式のファイルを直接は出力できないけど、Pythonでマクロが書けるから、それを実行しろとのこと。

![ai2](ai2.png)

言われた通りFreeCADの上でマクロ実行してみる。

![ai3](ai3.png)

驚いたことに、結構な確度でモデル化が出来ている。FreeCADはツール→Measureを使うと定規カーソルになって各部の長さを測定できるので、検証していくと良い。細かなところは結構間違いがあるものの、0からFreeCADで図面をおこすよりも、これをベースに直した方がずっと楽そうだ。FreeCADの操作をするのではなく、このPythonコードを直せば良いというのも実に楽で良い。

2時間ほど悩みながら直したコードが[これ](https://github.com/ruimo/freecad-py/blob/main/Jack/RCA/aitendo-AV2-8.4-10GA.py)。この程度の長さのコードで、この造形が得られるというのは、とても良い。座標の指定に値そのものではなく式も使えるところも良いし、PythonコードなのでGitHubに登録して変更管理できるのも良い。

このコードで得られる3Dモデルはこんな感じ。

![finalmodel](finalmodel.png)

これをEasyEDAに取り込むために、File→エクスポートで、step形式にエクスポートする。

![export](export.png)

EasyEDAに戻って、3D Modelから、Addを選ぶ。

![add3d](add3d.png)

ダイアログが表示されるので、さきほどエクスポートしたstepファイルを指定する。Categoryは、これまでと同様にJack→RCAを作って設定する。

![add3d2](add3d2.png)

Deviceを表示して、右クリックし、Link 3D Model...を実行する。

![link3d](link3d.png)

先ほど登録した3Dモデルを選択すると、右側に表示されるので、拡大アイコンをクリックする。

![link3d2](link3d2.png)

マウスでドラッグすると、左ボタンだと回転、右ボタンだと移動。ホイールで拡大縮小できるので、うまくはまるように、Offsetを(角度が合わないならRotationも)調整してやる。ここでズレる時は、PCB設計か3D設計が間違っているので確認する。

![3doffset](3doffset.png)

ここまで出来たら、回路図エディタで使ってみよう。まずさきほどの回路図とPCBからRCAジャックのコンポーネントを削除しておき、回路図エディタに再度、同じ手順でコンポーネントを追加する。すると次のようなダイアログが表示されるので、Updateを選ぶ。

![needupdate](needupdate.png)

すると以下のように3Dモデルを追加するよというダイアログが表示されるのでConfirmをクリック。

![3dmodeladded](3dmodeladded.png)

回路図に登録されたら、また結線してやってDesign→UpdateでPCBを更新する。PCB画面に飛んだら、RouteもUnroute→Allで一度解除してから再度Auto Routeをやり直す。

![finalpcb](finalpcb.png)

3Dボタンで、3Dモデルも確認する。

![final3d](final3d.png)

ちゃんと取り込まれたので、これを使えばケースの設計も可能になった。自分で作ったコンポーネントは、Personalに入るので他の人に見えないのかなと思ったら、普通に誰でも使えるようだ。'aitendo'で検索したら出てきた。

![reuse](reuse.png)

だいぶEasyEDAの使い方が分かった気がする。

