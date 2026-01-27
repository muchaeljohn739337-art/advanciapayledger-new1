#!/bin/bash

# Advancia Pay Ledger - Check Blockage Alignments Needed to Be Fixed
echo "👑 Advancia Pay Ledger - Check Blockage Alignments Needed to Be Fixed"
echo "===================================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "🔍 Action: BLOCKAGE_ANALYSIS"
echo "🎯 Purpose: ALIGNMENT_CORRECTION"
echo "🔧 Method: SYSTEM_ALIGNMENT_CHECK"
echo ""

# Check Blockage Alignments Needed to Be Fixed
cd "$(dirname "$0")/.."
npx ts-node src/scripts/check-blockage-alignments.ts

echo ""
echo "✅ Blockage Alignment Check - COMPLETE"
