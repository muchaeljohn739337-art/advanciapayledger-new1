#!/bin/bash

# Advancia Pay Ledger - Admin Mode Activation and User Registration
echo "👑 Advancia Pay Ledger - Admin Mode Activation and User Registration"
echo "====================================================================="
echo "👤 Admin: CHINEMELUM_MMADUBUGWU"
echo "🔐 Action: ADMIN_MODE_ACTIVATED"
echo "🔍 Action: ADMIN_LOGIN_CHECKING"
echo "🔧 Action: CHECKING_ALL_WORKFLOWS"
echo "👥 Action: ADMIN_REGISTER_USER_1"
echo "🗑️ Action: REMOVING_ANY_OTHER_PERSON"
echo "🧼 Action: TOTAL_CLEANING"
echo ""

# Admin Mode Activation
cd "$(dirname "$0")/.."
npx ts-node src/scripts/admin-mode-activation.ts

echo ""
echo "✅ Admin Mode Activation - COMPLETE"
