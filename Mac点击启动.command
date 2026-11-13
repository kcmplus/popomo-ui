#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  python3 tools/server.py
elif command -v node >/dev/null 2>&1; then
  node tools/server.mjs
else
  echo "Please install Python 3 or Node.js, then run this launcher again."
  read -r -p "Press Enter to close..."
fi
