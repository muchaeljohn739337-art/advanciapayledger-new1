#!/bin/bash

# Advancia Pay Ledger - Operator System Transfer and Wealth Redistribution
echo "👑 Advancia Pay Ledger - Operator System Transfer and Wealth Redistribution"
echo "============================================================================"
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🎯 Action: SYSTEM_TRANSFER_AND_WEALTH_REDISTRIBUTION"
echo "👥 Transfer To: CHINEMELUM_MMADUBUGWU"
echo "👤 New Admin: CHINEMELUM_MMADUBUGWU"
echo "💰 Wealth Transfer To: BASIL_MMADUBUGWU"
echo "🗑️ Final Action: REMOVE_ADVANCIA_PAYLEDGER"
echo ""

# Operator System Transfer
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-system-transfer.ts

echo ""
echo "✅ Operator System Transfer - COMPLETE"
