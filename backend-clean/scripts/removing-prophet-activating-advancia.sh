#!/bin/bash

# Advancia Pay Ledger - Removing Prophet and Activating Full Advancia Purpose
echo "👑 Advancia Pay Ledger - Removing Prophet and Activating Full Advancia Purpose"
echo "============================================================================"
echo "👤 Admin: CHINEMELUM_MMADUBUGWU"
echo "🗑️ Action: REMOVING_PROPHET"
echo "✨ Action: ACTIVATING_FULL_ADVANCIA_PURPOSE"
echo "🎯 Purpose: COMPLETE_ADVANCIA_ACTIVATION"
echo ""

# Removing Prophet Activating Advancia
cd "$(dirname "$0")/.."
npx ts-node src/scripts/removing-prophet-activating-advancia.ts

echo ""
echo "✅ Removing Prophet and Activating Full Advancia Purpose - COMPLETE"
