#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# EAS BUILD DIAGNOSTIC — Background Removal autolinking discovery (worker-side).
#
# WHY THIS EXISTS: Builds 8-11/16/17/20 silently dropped the expo-background-removal
# module on the EAS worker while every other module linked. Local pod install finds
# it; the worker does not. This runs the worker's OWN autolinking discovery so we can
# read its reasoning in the build log. Instrumentation only — NOT a fix.
#
# REVERT this commit after the diagnostic build. Read-only; always exits 0.
# ─────────────────────────────────────────────────────────────────────────────
echo "===== BG-REMOVAL DIAGNOSTIC (eas-build-post-install, worker) ====="
echo "--- environment ---"
pwd
node --version
node -e "console.log('expo-modules-autolinking', require('expo-modules-autolinking/package.json').version)" || true

echo "--- are the module files on the worker DISK? ---"
ls -la modules/expo-background-removal 2>&1 || echo ">>> modules/expo-background-removal MISSING ON DISK <<<"
ls -la modules/expo-background-removal/ios 2>&1 || true

echo "--- autolinking VERIFY -v (apple) — the discovery reasoning ---"
node --no-warnings --eval "require('expo/bin/autolinking')" expo-modules-autolinking verify --platform apple -v 2>&1 || true

echo "--- autolinking RESOLVE — is background-removal in the worker's resolved set? ---"
node --no-warnings --eval "require('expo/bin/autolinking')" expo-modules-autolinking resolve --platform apple --json 2>&1 | grep -i "background-removal" || echo ">>> background-removal ABSENT from resolve output <<<"

echo "===== END BG-REMOVAL DIAGNOSTIC ====="
true
