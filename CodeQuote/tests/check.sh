cd "$(dirname "${BASH_SOURCE[0]}")/.." || { echo "Cannot find project root"; exit 1; }

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

check_file() {
  if [ -s "$1" ]; then
    pass "$1 exists and is not empty"
  else
    fail "$1 is missing or empty"
  fi
}
check_contains() {
  if [ -f "$1" ] && grep -qF -- "$2" "$1"; then
    pass "$3"
  else
    fail "$3"
  fi
}

echo "=============================="
echo " CodeQuote automated checks"
echo "=============================="

echo
echo "1. Required files"
check_file "app/index.html"
check_file "app/style.css"
check_file "app/script.js"
check_file "app/health.html"

echo
echo "2. HTML content"
check_contains "app/index.html" "<title>CodeQuote" "index.html has the CodeQuote title"
check_contains "app/index.html" 'href="style.css"'  "index.html links to style.css"
check_contains "app/index.html" 'src="script.js"'   "index.html links to script.js"

echo
echo "3. JavaScript functionality"
check_contains "app/script.js" "const quotes"        "script.js has the quotes array"
check_contains "app/script.js" "getRandomQuote"      "script.js can generate a new quote"
check_contains "app/script.js" "getDailyQuote"       "script.js has the daily quote feature"
check_contains "app/script.js" "localStorage"        "script.js saves favorites with localStorage"
check_contains "app/script.js" "copyToClipboard"     "script.js can copy quotes"
check_contains "app/script.js" "navigator.share"     "script.js supports the Web Share API"

QUOTE_COUNT=$(grep -cE '^[[:space:]]*\{ id: [0-9]+,' app/script.js 2>/dev/null)
QUOTE_COUNT=${QUOTE_COUNT:-0}
if [ "$QUOTE_COUNT" -ge 20 ]; then
  pass "script.js contains $QUOTE_COUNT quotes (at least 20 required)"
else
  fail "script.js contains only $QUOTE_COUNT quotes (at least 20 required)"
fi

if command -v node >/dev/null 2>&1; then
  if node --check app/script.js 2>/dev/null; then
    pass "script.js has valid JavaScript syntax"
  else
    fail "script.js has a JavaScript syntax error"
  fi
else
  echo "  [SKIP] Node.js not installed, skipping JavaScript syntax check"
fi

echo
echo "4. Health check page"
check_contains "app/health.html" "OK" "health.html contains the OK message"

echo
echo "=============================="
echo " Passed: $PASS   Failed: $FAIL"
echo "=============================="

if [ "$FAIL" -gt 0 ]; then
  echo "RESULT: TESTS FAILED"
  exit 1
fi

echo "RESULT: ALL TESTS PASSED"
exit 0