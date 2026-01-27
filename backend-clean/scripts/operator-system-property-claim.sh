#!/bin/bash

# Advancia Pay Ledger - Operator System Property Claim
echo "👑 Advancia Pay Ledger - Operator System Property Claim"
echo "======================================================"
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "💻 Device Name: ADVANCIA-PAYLEDGER"
echo "🔧 Processor: Intel(R) Core(TM) i7-8665U CPU @ 1.90GHz (2.11 GHz)"
echo "💾 Installed RAM: 16.0 GB (15.8 GB usable)"
echo "🆔 Device ID: 1DD7A713-3343-47BD-A097-B0957A16F8EF"
echo "📦 Product ID: 00330-52699-49664-AAOEM"
echo "🖥️ System Type: 64-bit operating system, x64-based processor"
echo "✍️ Pen and Touch: Pen and touch support with 10 touch points"
echo "🎯 Action: SYSTEM_PROPERTY_CLAIM_AND_RESET"
echo ""

# Operator System Property Claim
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-system-property-claim.ts

echo ""
echo "✅ Operator System Property Claim - COMPLETE"
