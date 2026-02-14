# 記事規格（Article Specification）

本ドキュメントは、テンプレ実装ガイド記事の構造・frontmatter・必須セクションを定義する。

## 1. ファイル形式

- 形式: MDX（`.mdx`）
- 単位: **1ノート = 1記事**
- 配置: `content/{section}/{slug}.mdx`
- section: `templates` | `guides` | `troubleshooting` | `changelog`

## 2. Frontmatter（必須フィールド）

```yaml
---
template_id: "TMPL-{CATEGORY}-{NNN}" # 例: TMPL-LINE-001, TS-LINE-001
title: "記事タイトル"
category: "LINE" # LINE | Obsidian | X | Ops
difficulty: "beginner" # beginner | intermediate | advanced
duration_bucket: "mid" # short(~15min) | mid(30-60min) | long(60+min)
prerequisites:
  - "前提条件1（固有名詞/URL/数値なし）"
integrations:
  - "連携ツール/サービス名（一般化）"
version: "1.0.0"
last_verified_yyyy_mm: "2026-02"
visibility: "public" # public | private
tags:
  - "タグ1"
description: "価値を1行で（定性的、数値なし）"
---
```

### template_id 採番規則

| セクション | プレフィックス | 例 |
|-----------|--------------|-----|
| templates | `TMPL-{CATEGORY}-{NNN}` | TMPL-LINE-001 |
| troubleshooting | `TS-{CATEGORY}-{NNN}` | TS-LINE-001 |
| guides | `GUIDE-{NNN}` | GUIDE-001 |
| changelog | `CL-{YYYY-MM}` | CL-2026-02 |

### カテゴリ（固定、安易に増やさない）

- `LINE`
- `Obsidian`
- `X`
- `Ops`

## 3. B主軸：テンプレ実装ガイド必須セクション

以下のセクションを **この順序で** 記載すること。

1. **概要** — 価値を1行で（定性的表現、数値なし）
2. **対象ユーザー** — 誰のための記事か
3. **前提条件** — 一般化（固有名詞/URL/数値なし）
4. **構成（ノード/データフロー）** — 処理の流れ
5. **セットアップ** — 画面/項目/操作レベルで再現性担保（具体値なし）
6. **運用（監視・例外・復旧）** — 日常運用のポイント
7. **詰まりTOP5** — よくある問題5つ
8. **反証3（失敗条件）** — うまくいかないケース3つ
9. **トラブルシュート** — 症状→原因→対処（テーブル形式推奨）
10. **Secrets注意** — 書かないルールの明示
11. **ロールバック（停止/戻し）** — 即時停止〜完全戻しの段階
12. **FAQ10** — よくある質問10個
13. **変更履歴** — 日付・変更内容・関連ID（diffは"何を変えたか"）
14. **last_verified** — 最終検証年月

## 4. 機密ポリシー（絶対遵守）

以下は `sanitized` / `publish` / `public docs` の記事に **一切含めない**:

- URL（内部・外部問わず）
- 企業名・個人名（実名）
- 数値（売上、件数、KPI等）
- 内部リンク（社内ツールのURL）
- トークン・APIキー・Webhook URL
- パスワード・認証情報
- その他、特定の組織/個人を識別可能な情報

数値は `raw_private`（Obsidian: `/00_raw_private`）にのみ保存可。

## 5. NotebookLM投入ルール

- 投入可能: `/10_sanitized` と `/20_publish` のファイルのみ
- 投入禁止: `/00_raw_private`、テンプレJSON本体、数値データ
- NotebookLMの用途: 整形と抜け漏れ検査のみ（成果物の正本はObsidian）
