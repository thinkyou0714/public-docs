#!/usr/bin/env bash
# ============================================================
# check-secrets.sh
# sanitized/publish 向けファイルに機密情報が混入していないかチェック
# 追加課金サービス不要。grep/sed のみで実装。
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# チェック対象ディレクトリ
CHECK_DIRS=(
  "$ROOT_DIR/content"
  "$ROOT_DIR/obsidian-templates"
)

FOUND=0
TOTAL_CHECKED=0

echo "============================================"
echo "  Secret / Sensitive Data Check"
echo "============================================"
echo ""

# --- Pattern Definitions ---
# 各パターン: "ラベル|正規表現"
PATTERNS=(
  "URL (http/https)|https?://"
  "IP Address|\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b"
  "Email Address|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
  "OpenAI Token|sk-[a-zA-Z0-9]{20,}"
  "Slack Token|xox[bprs]-[a-zA-Z0-9-]+"
  "Bearer Token|Bearer [a-zA-Z0-9._-]+"
  "Generic Secret Keyword (password)|[Pp]assword\s*[:=]"
  "Generic Secret Keyword (secret)|[Ss]ecret\s*[:=]"
  "Generic Secret Keyword (api_key)|[Aa]pi[_-]?[Kk]ey\s*[:=]"
  "Webhook URL Pattern|webhook[./]"
  "AWS Access Key|AKIA[0-9A-Z]{16}"
  "Private Key Header|-----BEGIN .* PRIVATE KEY-----"
)

# --- Whitelist (false positives to ignore) ---
# frontmatter のフィールド名や説明文中の一般的な言及は除外
WHITELIST_PATTERNS=(
  "^#"                          # Markdown headers
  "Secrets注意"                 # Section title
  "書かないルール"              # Description about the rule
  "記載しない"                  # "do not write"
  "記載禁止"                    # "writing forbidden"
  "非公開"                      # "not public"
  "password.*secret.*api"       # General mention pattern in checklist
  "例："                        # Example prefix in Japanese
  "検出パターン"                # "detection pattern" (in docs)
  "https\?://"                  # Pattern string itself (in scripts/docs)
  "webhook\[./\]"              # Pattern string itself
)

check_file() {
  local file="$1"
  local file_issues=0

  for pattern_entry in "${PATTERNS[@]}"; do
    local label="${pattern_entry%%|*}"
    local regex="${pattern_entry#*|}"

    # grep で検出（-n: 行番号、-i: 大文字小文字無視は一部のみ）
    local matches
    matches=$(grep -n -E "$regex" "$file" 2>/dev/null || true)

    if [ -n "$matches" ]; then
      # Whitelist チェック: すべての一致行がホワイトリストに該当するか
      local real_matches=""
      while IFS= read -r line; do
        local is_whitelisted=false
        for wl in "${WHITELIST_PATTERNS[@]}"; do
          if echo "$line" | grep -qE "$wl" 2>/dev/null; then
            is_whitelisted=true
            break
          fi
        done
        if [ "$is_whitelisted" = false ]; then
          real_matches="${real_matches}${line}\n"
        fi
      done <<< "$matches"

      if [ -n "$real_matches" ]; then
        if [ "$file_issues" -eq 0 ]; then
          echo -e "${RED}[FAIL]${NC} $file"
        fi
        echo -e "  ${YELLOW}Pattern: $label${NC}"
        echo -e "$real_matches" | head -5 | sed 's/^/    /'
        file_issues=$((file_issues + 1))
        FOUND=$((FOUND + 1))
      fi
    fi
  done

  if [ "$file_issues" -eq 0 ]; then
    echo -e "${GREEN}[PASS]${NC} $file"
  fi

  TOTAL_CHECKED=$((TOTAL_CHECKED + 1))
}

# --- Main ---
for dir in "${CHECK_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo -e "${YELLOW}[SKIP]${NC} Directory not found: $dir"
    continue
  fi

  # .mdx と .md ファイルを検索
  while IFS= read -r -d '' file; do
    check_file "$file"
  done < <(find "$dir" -type f \( -name "*.mdx" -o -name "*.md" \) -print0 2>/dev/null)
done

echo ""
echo "============================================"
echo "  Results: $TOTAL_CHECKED files checked"
echo "============================================"

if [ "$FOUND" -gt 0 ]; then
  echo -e "${RED}  $FOUND potential issue(s) found!${NC}"
  echo ""
  echo "  Review each finding above."
  echo "  If it's a false positive, add to WHITELIST_PATTERNS in this script."
  echo "  If it's real, remove the sensitive data before publishing."
  exit 1
else
  echo -e "${GREEN}  All clear — no secrets detected.${NC}"
  exit 0
fi
