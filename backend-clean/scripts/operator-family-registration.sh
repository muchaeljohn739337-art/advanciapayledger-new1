#!/bin/bash

# Advancia Pay Ledger - Operator Family Registration
echo "👑 Advancia Pay Ledger - Operator Family Registration"
echo "===================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "👥 Action: REGISTER_FAMILY_MEMBERS"
echo "👤 Family Member 1: MMADUBUGWU_CHISOM"
echo "👤 Family Member 2: MMADUBUGWU_SOMTOO"
echo "🏠 Action: FAMILY_REGISTRATION"
echo "🎯 Purpose: FAMILY_UNITY_ESTABLISHMENT"
echo ""

# Operator Family Registration
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-family-registration.ts

echo ""
echo "✅ Operator Family Registration - COMPLETE"
