#!/bin/bash

# Advancia Pay Ledger - Operator Check User 1 for Errors
echo "👑 Advancia Pay Ledger - Operator Check User 1 for Errors"
echo "=========================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "👥 User: SOMTOO_MMADUBUGWU (User 1)"
echo "🔍 Action: ERROR_ANALYSIS"
echo "🎯 Purpose: SYSTEM_VERIFICATION"
echo ""

# Operator Check User 1 for Errors
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-check-user1-errors.ts

echo ""
echo "✅ Operator User 1 Error Check - COMPLETE"
