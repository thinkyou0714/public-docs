# Contributing

記事の追加・更新・レビューの手順。

## クイックスタート

```bash
# 1. クローン
git clone https://github.com/thinkyou0714/public-docs.git
cd public-docs

# 2. セットアップ（依存関係 + pre-commit hook）
npm install

# 3. 開発サーバー起動
npm run dev     # → http://localhost:3000
```

## 記事の追加フロー

### Step 1: Obsidian で下書き

1. `obsidian-templates/TEMPLATE-GUIDE.md` をコピーして穴埋め
2. Obsidian Vault の `/00_raw_private` で自由に記述
3. 機密情報を除去して `/10_sanitized` にコピー
4. DoD 10項目セルフチェック
5. OK なら `/20_publish` に移動

### Step 2: template_id を採番

| セクション | フォーマット | 例 |
|-----------|------------|-----|
| templates | `TMPL-{CATEGORY}-{NNN}` | TMPL-LINE-002 |
| troubleshooting | `TS-{CATEGORY}-{NNN}` | TS-OBS-001 |
| guides | `GUIDE-{NNN}` | GUIDE-002 |
| changelog | `CL-{YYYY-MM}` | CL-2026-03 |

カテゴリ: `LINE` / `Obsidian` / `X` / `Ops`（安易に増やさない）

### Step 3: MDX ファイルを配置

```bash
# テンプレート記事の場合
content/templates/tmpl-{category}-{nnn}.mdx

# トラブルシュート記事の場合
content/troubleshooting/ts-{category}-{nnn}.mdx
```

### Step 4: チェック

```bash
# 機密チェック（pre-commit hook でも自動実行）
npm run check-secrets

# ローカルビルド
npm run build

# 開発サーバーで表示確認
npm run dev
```

### Step 5: コミット＆push

```bash
git add content/{section}/{slug}.mdx
git commit -m "Add {TMPL-ID}: {title}"
git push origin master
# → Vercel が自動デプロイ
# → GitHub Actions が CI を実行
```

## 記事の更新フロー

1. 該当 `.mdx` ファイルを編集
2. frontmatter の `version` をインクリメント
3. `last_verified_yyyy_mm` を更新
4. 「変更履歴」セクションに差分を追記
5. `npm run check-secrets` を実行
6. コミット＆push

## CI パイプライン

push / PR ごとに GitHub Actions で以下が自動実行:

| ジョブ | 内容 | ブロッキング |
|--------|------|------------|
| **Secret Check** | `check-secrets.mjs` で機密パターン検出 | Yes |
| **Build** | `npm run build` で静的サイト生成 | Yes |
| **DoD Validation** | frontmatter必須フィールド + テンプレ必須セクション | Yes (frontmatter), Warn (sections) |

## 機密ポリシー

> **絶対禁止**: URL、企業名/個人名、数値、トークン、APIキー、Webhook URL

詳細は `docs/security-checklist.md` を参照。

## レビューチェックリスト

- [ ] DoD 10項目すべて OK（`docs/dod-checklist.md`）
- [ ] `npm run check-secrets` PASS
- [ ] `npm run build` 成功
- [ ] 開発サーバーで表示確認済み
- [ ] 変更履歴に記録済み
