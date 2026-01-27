#!/bin/bash

# Advancia Pay Ledger - Operator Mode Stop
echo "👑 Advancia Pay Ledger - Operator Mode Stop"
echo "=========================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🛑 Action: OPERATOR_MODE_DEACTIVATION"
echo "🎯 Purpose: SYSTEM_HANDOVER"
echo "🔄 Transition: NORMAL_MODE_RESTORATION"
echo ""

# Operator Mode Stop
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-mode-stop.ts

echo ""
echo "✅ Operator Mode Stop - COMPLETE"
