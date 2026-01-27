#!/bin/bash

# Advancia Pay Ledger - Operator Checking Admin Safety and Performance
echo "👑 Advancia Pay Ledger - Operator Checking Admin Safety and Performance"
echo "====================================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🔍 Action: CHECKING_ADMIN_SAFETY"
echo "🔍 Action: SEARCHING_ADMIN_PERFORMANCE"
echo "👤 Target Admin: CHINEMELUM_MMADUBUGWU"
echo "🎯 Purpose: ADMIN_SAFETY_VERIFICATION"
echo ""

# Operator Checking Admin Safety
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-checking-admin-safety.ts

echo ""
echo "✅ Operator Admin Safety Check - COMPLETE"
