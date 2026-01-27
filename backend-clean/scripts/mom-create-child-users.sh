#!/bin/bash

# Advancia Pay Ledger - Mom Creates Two Users for Children
echo "👑 Advancia Pay Ledger - Mom Creates Two Users for Children"
echo "============================================================"
echo "👩‍👦 Mom: IFEOMA MMADUBUGWU"
echo "👥 Task: CREATE_TWO_CHILD_USERS"
echo "🤖 Check: BASE_AI_STATUS"
echo ""

# Mom Creates Two Child Users
cd "$(dirname "$0")/.."
npx ts-node src/scripts/mom-create-two-child-users.ts

echo ""
echo "✅ Mom Child User Creation - COMPLETE"
