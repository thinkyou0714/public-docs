# 運用ランブック — Daily Workflow

## 概要

Obsidian正本 → sanitized → publish → 自動デプロイ の日常運用フロー。

---

## 1. 新規記事の作成フロー

### Step 1: Template ID 採番

1. `docs/template-registry.md` を開く
2. 次の連番を確認（例: `TMPL-LINE-002`）
3. ステータスを `reserved` で登録

### Step 2: Obsidian で下書き（raw）

1. `/00_raw_private/` に新規ファイルを作成
   - ファイル名: `{TEMPLATE_ID}-raw.md`
   - タグ: `#raw #{category}`
2. 自由に書く（数値OK、URL OK、機密OK）
3. **このファイルは NotebookLM に絶対に入れない**

### Step 3: sanitized 化

1. `/00_raw_private/` のファイルをコピーして `/10_sanitized/` に配置
2. 以下を確認・除去:
   - [ ] URL → 削除 or 一般化（「管理画面の設定ページ」等）
   - [ ] 企業名/個人名 → 削除
   - [ ] 数値 → 削除 or 一般化（「一定数」「閾値を超えた場合」等）
   - [ ] トークン/API Key → 「環境変数で管理」に置換
   - [ ] 内部リンク → ID参照に変換
3. タグを `#sanitized` に変更
4. **NotebookLM に投入 OK**（整形・抜け漏れ検査用）
5. **顧客に送信 OK**

### Step 4: NotebookLM チェック（任意）

1. `/10_sanitized/` のファイルを NotebookLM に投入
2. 固定出力を確認:
   - 30秒要約（3行）
   - 決定事項
   - 未決（質問だけ）
   - 次アクション（役割ベース、期限は相対）
   - リスク（一般化）
   - 参照ID（URL禁止）
3. 不足があれば Obsidian 側を加筆

### Step 5: publish 用 MDX 作成

1. Obsidian テンプレート `TEMPLATE-GUIDE.md` の穴埋め式で記事を作成
2. `/20_publish/` に配置、タグを `#publish` に変更
3. 必須セクション（14項目）がすべて埋まっていることを確認

### Step 6: public-docs リポに反映

```bash
# 1. ブランチ作成
git checkout -b article/{TEMPLATE_ID}

# 2. sanitized から同期（まず dry-run）
npm run sync-sanitized

# 3. 問題なければ apply
node scripts/sync-sanitized.mjs --apply

# 4. 必要に応じて MDX ファイルを微修正

# 5. 機密チェック
npm run check-secrets

# 6. DoD レポート
npm run dod-report

# 7. ビルド確認
npm run build

# 8. コミット & プッシュ
git add .
git commit -m "Add {TEMPLATE_ID}: {title}"
git push -u origin HEAD

# 9. PR 作成（DoD チェックリスト付きテンプレートが自動表示）
gh pr create --title "Add {TEMPLATE_ID}" --body "DoD checklist attached"
```

### Step 6B: GitHub Actions の手動実行（運用担当向け）

1. `obsidian-sync/10_sanitized/` に `*-sanitized.md` を配置して push
2. GitHub Actions の `Sync Sanitized Snapshots` を開く
3. まず `apply=false` で実行（dry-run）
4. 問題なければ `apply=true` で再実行
5. 自動反映したい場合のみ `auto_commit=true` を指定

### Step 7: CI 通過 → マージ → 自動デプロイ

1. GitHub Actions が自動実行（secret-check → build → dod-check）
2. すべて通過したらマージ
3. Vercel が自動デプロイ

---

## 2. 記事更新フロー

1. Obsidian `/00_raw_private/` の該当ファイルを更新
2. sanitized 化を再実施 → `/10_sanitized/` 更新
3. `/20_publish/` の MDX を更新
4. `public-docs` の `content/` 配下のファイルを更新
5. 変更履歴セクションに差分を追記
6. `last_verified_yyyy_mm` を更新
7. PR → CI → マージ → 自動デプロイ

---

## 3. 日次チェック（5分）

| チェック | 方法 | 頻度 |
|----------|------|------|
| Vercel デプロイステータス | Vercel Dashboard | 日次 |
| CI 結果 | GitHub Actions タブ | PR時 |
| Dependabot PR | GitHub Notifications | 週次 |
| `#secret_suspected` タグ | Obsidian 検索 | 日次 |

---

## 4. 定期メンテナンス（週次）

1. `npm run dod-report` で全記事の DoD 達成度を確認
2. 未達記事をリストアップして優先度付け
3. Dependabot PR をレビュー・マージ
4. `template-registry.md` のステータスを更新

---

## 5. 緊急対応：機密混入発覚時

### 即時対応

1. **該当ファイルを特定**: `npm run check-secrets` で検出
2. **機密を除去**: 該当行を削除 or 一般化
3. **コミット & プッシュ**: 修正を即座にデプロイ
4. **Git 履歴からの除去**（必要な場合）:
   ```bash
   # 注意: force push が必要
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch {FILE}' HEAD
   git push --force
   ```

### 事後対応

- 原因を `/00_raw_private/` にメモ
- sanitized 化チェックリストに項目追加（再発防止）
- チームへの共有

---

## 6. コマンド早見表

| タスク | コマンド |
|--------|---------|
| 開発サーバー起動 | `npm run dev` |
| ビルド（sitemap 生成含む） | `npm run build` |
| 機密チェック | `npm run check-secrets` |
| sanitized 同期（dry-run） | `npm run sync-sanitized` |
| sanitized 同期（apply） | `node scripts/sync-sanitized.mjs --apply` |
| DoD レポート | `npm run dod-report` |
| pre-commit フック再インストール | `npm run prepare` |
