#!/bin/bash
# Auto-deploy script: commits and force-pushes all changes to the main branch
# Usage: bash scripts/auto-deploy.sh

set -e

cd "$(dirname "$0")/.."

git add .
git commit -m "Auto-deploy: periodic update $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main --force

echo "Auto-deploy complete."
