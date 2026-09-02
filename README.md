# VALORANT Map Pick

VALORANTのカスタムマッチ向けMAP BAN・PICKツールです。BO1、BO3、BO5を1つの画面から選択できます。

## データの更新

- チームとメンバー: `data/teams.json`
- マッププール: `data/maps.json`

マップを出し入れするときは、`maps.json`の`enabled`を変更します。ドラフトは7マップを前提としているため、`enabled: true`は必ず7件にしてください。

## ローカルでの確認

JSONを読み込むため、`index.html`をダブルクリックするのではなくHTTPサーバーを利用します。

Pythonがある場合はリポジトリ直下で次を実行します。

```powershell
python -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/` を開きます。

## GitHub Pages

リポジトリのルートをGitHub Pagesの公開元に設定してください。ルートの`index.html`が公開入口です。

## 旧版

統合前のHTMLとJavaScriptは`html/`および`js/main.js`、`js/bo3.js`、`js/bo5.js`に残しています。新しい画面では使用していません。
