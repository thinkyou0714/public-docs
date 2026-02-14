# public-docs

Template Implementation Guides — 公開ドキュメントサイト

**本番サイト**: https://public-docs-phi.vercel.app

## 概要

Next.js (App Router) + MDX で構築された静的サイト。Vercel でデプロイ。
テンプレート実装ガイドを公開し、誰でも再現可能な手順を提供する。

**機密ポリシー**: このリポジトリには URL、企業名/個人名、数値、トークン等の機密情報を **一切含めない**。

## Tech Stack

- Next.js 15 (App Router, Static Export)
- MDX (gray-matter + next-mdx-remote)
- Tailwind CSS 3
- Vercel (デプロイ先)

## ディレクトリ構成

```
public-docs/
├── content/              # MDXコンテンツ（記事本体）
│   ├── templates/        # テンプレ実装ガイド
│   ├── guides/           # 共通ガイド
│   ├── troubleshooting/  # 症状記事
│   └── changelog/        # 更新履歴
├── src/
│   ├── app/              # Next.js App Router
│   ├── lib/              # コンテンツローダー等
│   └── components/       # UIコンポーネント
├── docs/                 # 運用ドキュメント
│   ├── article-spec.md   # 記事規格
│   ├── dod-checklist.md  # DoD 10項目
│   └── security-checklist.md  # 機密チェック手順
├── scripts/
│   └── check-secrets.sh  # 機密混入検出スクリプト
└── obsidian-templates/   # Obsidian穴埋めテンプレート
```

## カテゴリ

| カテゴリ | 説明 |
|---------|------|
| LINE | LINE関連の自動化テンプレート |
| Obsidian | ナレッジ管理テンプレート |
| X | X(Twitter)連携テンプレート |
| Ops | 運用自動化テンプレート |

## 運用手順

### 記事の追加

1. `docs/article-spec.md` で記事規格を確認
2. `obsidian-templates/TEMPLATE-GUIDE.md` をコピーして穴埋め
3. template_id を採番（例: `TMPL-LINE-002`）
4. `content/{section}/{slug}.mdx` として配置
5. frontmatter の全必須フィールドを記入

### 記事の更新

1. 該当 `.mdx` ファイルを編集
2. `version` をインクリメント
3. `last_verified_yyyy_mm` を更新
4. 「変更履歴」セクションに差分を追記

### DoD チェック（公開前必須）

1. `docs/dod-checklist.md` の10項目を自己チェック
2. 機密チェックスクリプトを実行:

```bash
npm run check-secrets
# または
bash scripts/check-secrets.sh
```

3. 全項目OKを確認してからコミット・デプロイ

### デプロイ

```bash
# ローカル確認
npm run dev

# ビルド（静的出力）
npm run build

# Vercel（mainブランチへのpushで自動デプロイ）
git push origin main
```

## template_id 採番規則

| セクション | フォーマット | 例 |
|-----------|------------|-----|
| templates | `TMPL-{CATEGORY}-{NNN}` | TMPL-LINE-001 |
| troubleshooting | `TS-{CATEGORY}-{NNN}` | TS-LINE-001 |
| guides | `GUIDE-{NNN}` | GUIDE-001 |
| changelog | `CL-{YYYY-MM}` | CL-2026-02 |

## P0 記事一覧

| template_id | カテゴリ | セクション | タイトル |
|-------------|---------|----------|---------|
| TMPL-LINE-001 | LINE | templates | LINE公式アカウント自動応答テンプレート |
| TMPL-OBS-001 | Obsidian | templates | Obsidianナレッジベース自動整理テンプレート |
| TMPL-X-001 | X | templates | X(Twitter)投稿自動化テンプレート |
| TMPL-OPS-001 | Ops | templates | 定期レポート自動生成テンプレート |
| TS-LINE-001 | LINE | troubleshooting | LINE Webhook が応答しない |

## Obsidian連携

Obsidian Vault での運用フォルダ:

| フォルダ | 用途 | 機密 | NotebookLM |
|---------|------|------|-----------|
| `/00_raw_private` | 生データ、機密OK | OK | **禁止** |
| `/10_sanitized` | 顧客送付用、機密ゼロ | **禁止** | OK |
| `/20_publish` | サイト公開用、機密ゼロ | **禁止** | OK |

## CI/CD

| ステージ | ツール | トリガー |
|---------|-------|---------|
| ローカル機密チェック | pre-commit hook (`check-secrets.mjs`) | `git commit` |
| CI（機密+ビルド+DoD） | GitHub Actions | push / PR to master |
| デプロイ | Vercel | master push（自動） |

```bash
# セットアップ（hook自動インストール含む）
npm install

# ローカル開発
npm run dev

# 機密チェック
npm run check-secrets

# ビルド（sitemap自動生成 + 静的出力）
npm run build
```

## 関連リポジトリ

- **private-members** — テンプレJSON本体、会員向け詳細、sanitized運用Tips（別リポジトリ・非公開）
