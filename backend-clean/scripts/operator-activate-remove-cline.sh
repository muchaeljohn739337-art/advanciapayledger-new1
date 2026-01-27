#!/bin/bash

# Advancia Pay Ledger - Operator Activate Remove Anything Cline
echo "👑 Advancia Pay Ledger - Operator Activate Remove Anything Cline"
echo "=============================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🔧 Action: ACTIVATE_REMOVE_CLINE"
echo "🎯 Purpose: SYSTEM_CLEANUP"
echo "🗑️ Target: ANYTHING_CLINE_RELATED"
echo ""

# Operator Activate Remove Anything Cline
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-activate-remove-cline.ts

echo ""
echo "✅ Operator Cline Removal - COMPLETE"
