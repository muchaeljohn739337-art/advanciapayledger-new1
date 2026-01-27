#!/bin/bash

# Advancia Pay Ledger - Mom Checks SOMTOO and CHISOM
echo "👑 Advancia Pay Ledger - Mom Checks SOMTOO and CHISOM"
echo "======================================================"
echo "👩‍👦 Mom: IFEOMA MMADUBUGWU"
echo "👥 Check: SOMTOO_CHISOM_STATUS"
echo "🔍 Action: VERIFY_AND_CREATE_IF_NEEDED"
echo ""

# Mom Checks SOMTOO and CHISOM
cd "$(dirname "$0")/.."
npx ts-node src/scripts/mom-check-somtoo-chisom.ts

echo ""
echo "✅ Mom SOMTOO and CHISOM Check - COMPLETE"
