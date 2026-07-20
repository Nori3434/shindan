# 証券口座診断ツール

投資をこれから始める人が「最初の1社」を選ぶための静的診断ツール。3問に答えると、回答に事実上もっとも合う証券会社を提示する。

公開URL: https://nori3434.github.io/shindan/
運営: [noripon-ai.com](https://noripon-ai.com)

## 設計の前提

このツールは**広告報酬の有無で順位を変えない**。

- 判定ロジック（`logic.js`）は報酬に関するフィールドを一切参照しない。テストで静的に検査している（`test/run-tests.mjs`）
- 同点の場合はタイブレークで無理に1社に絞らず、両論併記する。優先ペアはマトリクスで明文化されたものだけ
- 除外した会社は「なぜ外したか」を結果画面に正直に表示する
- 最頻出の回答パターンは、現時点で報酬の出ない会社に着地する設計になっている

判定表の全文は [`diagnosis-matrix.md`](./diagnosis-matrix.md)（3問 + 除外ゲート + 加点式、誠実性監査13パターン付き）。

## 現在のリンク状態

**アフィリエイトリンクは1本も含んでいない。** 全6社とも素の公式サイトURLを指している（2026-07-20 時点で到達確認済み）。

提携が承認された会社が出たら、その会社だけ `data.js` の `cta.url` をアフィリエイトリンクに、`cta.type` を `"a8-active"` に変更する。`type` を変えずに `url` だけ差し替えると、広告リンクが「広告ではありません」と表示されてしまう。

## 構成

依存ゼロの vanilla JS。ビルド不要。

| ファイル | 役割 |
|---|---|
| `index.html` | マークアップ |
| `data.js` | 会社データ・採点表・コンプラ文面 |
| `logic.js` | 診断ロジック（報酬非参照） |
| `app.js` | UI 描画・iframe 高さ通知 |
| `style.css` | スタイル |
| `test/run-tests.mjs` | テスト（`node test/run-tests.mjs`） |

## 埋め込み

親ページへ `postMessage` で高さを通知する（`{ type: "shindan-height", height }`）。埋め込み側は message を受けて iframe の高さを更新する。

```html
<iframe src="https://nori3434.github.io/shindan/" style="width:100%;border:0;" id="shindan"></iframe>
<script>
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'shindan-height') {
    document.getElementById('shindan').style.height = e.data.height + 'px';
  }
});
</script>
```

## ソース

正本は `AntiGravity/affiliate-blog/shindan/`。このリポジトリは GitHub Pages 配信用のミラーで、更新は正本側を直してからコピーする。
