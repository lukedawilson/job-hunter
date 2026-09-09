#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [ -f .agents/skills/unslop/SKILL.md ]; then
  echo "unslop already installed at .agents/skills/unslop"
  exit 0
fi

if [ ! -f skills-lock.json ]; then
  echo "skills-lock.json not found at repo root" >&2
  exit 1
fi

echo "Installing skills from skills-lock.json into .agents/skills/"
npx --yes skills@latest experimental_install

if [ ! -f .agents/skills/unslop/SKILL.md ]; then
  echo "unslop install failed: .agents/skills/unslop/SKILL.md not found" >&2
  exit 1
fi

echo "unslop installed"
