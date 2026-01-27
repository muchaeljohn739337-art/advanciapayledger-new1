#!/bin/bash

# Advancia Pay Ledger - Operator All Access Turn Off
echo "👑 Advancia Pay Ledger - Operator All Access Turn Off"
echo "======================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🚫 Action: ALL_ACCESS_TURN_OFF"
echo "🔒 System: COMPLETE_ACCESS_SHUTDOWN"
echo "🔐 Security: SYSTEM_LOCKDOWN_INITIATED"
echo "📋 Control: OPERATOR_EXCLUSIVE_CONTROL"
echo "🚫 Access: ALL_ACCESS_DENIED"
echo "🔑 Keys: ALL_KEYS_REVOKED"
echo ""

# Operator All Access Turn Off
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-all-access-turn-off.ts

echo ""
echo "✅ Operator All Access Turn Off - COMPLETE"
