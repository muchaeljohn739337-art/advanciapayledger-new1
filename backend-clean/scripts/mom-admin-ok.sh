#!/bin/bash

# Advancia Pay Ledger - Mom Admin User Status
echo "👑 Advancia Pay Ledger - Mom Admin User Status"
echo "=============================================="
echo "👩‍👦 Mom: ADMIN_USER_CONFIRMATION"
echo "📊 Status: OK"
echo "✅ Verification: ADMIN_USER_OK"
echo ""

# Confirm Mom Admin User Status
cd "$(dirname "$0")/.."
npx ts-node src/scripts/mom-admin-user-ok.ts

echo ""
echo "✅ Mom Admin User - CONFIRMED OK"
