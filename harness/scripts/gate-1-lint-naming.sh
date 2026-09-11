#!/bin/sh
# Gate 1: lint + naming (gates-and-hooks.md). Two legs, both hard:
#   eslint (naming-convention + check-file per kb/conventions/naming.md)
#   naming-check.mjs (kebab-case file leg) over each package src
set -eu
npx eslint .
for d in app api pipeline shared; do
  node harness/scripts/naming-check.mjs "$d/src"
done
echo "gate 1: lint+naming clean"
