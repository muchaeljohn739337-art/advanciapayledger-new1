#!/bin/bash

# Advancia Pay Ledger - Operator Mode Checking Admin Consequences
echo "👑 Advancia Pay Ledger - Operator Mode Checking Admin Consequences"
echo "=================================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🔍 Action: CHECKING_ADMIN_CONSEQUENCES"
echo "📋 Action: LISTING_ALL_CONSEQUENCES"
echo "👤 Target Admin: CHINEMELUM_MMADUBUGWU"
echo "🎯 Purpose: COMPLETE_CONSEQUENCES_ANALYSIS"
echo ""

# Operator Checking Admin Consequences
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-checking-admin-consequences.ts

echo ""
echo "✅ Operator Admin Consequences Check - COMPLETE"
