# Template ID Registry

全記事の採番一覧。新しい記事を追加する際はここに登録してから作成すること。

## 採番規則

| セクション | フォーマット | 連番開始 |
|-----------|------------|---------|
| templates | `TMPL-{CATEGORY}-{NNN}` | 001 |
| troubleshooting | `TS-{CATEGORY}-{NNN}` | 001 |
| guides | `GUIDE-{NNN}` | 001 |
| changelog | `CL-{YYYY-MM}` | — |

カテゴリ: `LINE` / `OBS` / `X` / `OPS`

## 登録済み ID

### Templates

| ID | カテゴリ | タイトル | ステータス | 作成日 |
|----|---------|---------|----------|-------|
| TMPL-LINE-001 | LINE | LINE公式アカウント自動応答テンプレート | published | 2026-02 |
| TMPL-OBS-001 | Obsidian | Obsidianナレッジベース自動整理テンプレート | published | 2026-02 |
| TMPL-X-001 | X | X(Twitter)投稿自動化テンプレート | published | 2026-02 |
| TMPL-OPS-001 | Ops | 定期レポート自動生成テンプレート | published | 2026-02 |

### Troubleshooting

| ID | カテゴリ | タイトル | ステータス | 作成日 |
|----|---------|---------|----------|-------|
| TS-LINE-001 | LINE | LINE Webhookが応答しない | published | 2026-02 |

### Guides

| ID | タイトル | ステータス | 作成日 |
|----|---------|----------|-------|
| GUIDE-001 | 記事の書き方ガイド | published | 2026-02 |

### Changelog

| ID | タイトル | ステータス | 作成日 |
|----|---------|----------|-------|
| CL-2026-02 | 変更履歴 2026-02 | published | 2026-02 |

## 次に使える番号

| カテゴリ | Templates | Troubleshooting |
|---------|-----------|----------------|
| LINE | TMPL-LINE-002 | TS-LINE-002 |
| Obsidian | TMPL-OBS-002 | TS-OBS-001 |
| X | TMPL-X-002 | TS-X-001 |
| Ops | TMPL-OPS-002 | TS-OPS-001 |
| Guides | GUIDE-002 | — |

## 運用ルール

1. 新記事を書き始める前に、このファイルに ID を「reserved」ステータスで追加する
2. 記事が公開されたら「published」に変更する
3. 記事を非推奨にする場合は「deprecated」に変更し、代替 ID を記載する
4. ID は一度発番したら再利用しない
