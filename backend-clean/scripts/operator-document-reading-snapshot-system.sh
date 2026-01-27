#!/bin/bash

# Advancia Pay Ledger - Operator Document Reading and Snapshot System
echo "👑 Advancia Pay Ledger - Operator Document Reading and Snapshot System"
echo "===================================================================="
echo "👩‍👦 Operator: IFEOMA_MMADUBUGWU"
echo "📚 Action: READING_ALL_DOCUMENTS"
echo "📋 Purpose: LISTING_ALL_DOCUMENTS"
echo "📸 Snapshot: TAKING_SNAPSHOTS"
echo "📁 Scope: COMPLETE_DOCUMENT_SYSTEM"
echo "🔍 Analysis: DOCUMENT_ANALYSIS_SYSTEM"
echo "💾 Storage: SNAPSHOT_STORAGE_SYSTEM"
echo ""

# Operator Document Reading and Snapshot System
cd "$(dirname "$0")/.."
npx ts-node src/scripts/operator-document-reading-snapshot-system.ts

echo ""
echo "✅ Operator Document Reading and Snapshot System - COMPLETE"
