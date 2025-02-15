#!/bin/bash

# Archive pre-baseline migrations
ARCHIVE_DIR="supabase/migrations/archived/2025_02_pre_baseline"
MIGRATIONS_DIR="supabase/migrations"
BASELINE_TIMESTAMP="20250206121400"

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Move all migrations before the baseline to archive
for file in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$file")
    timestamp="${filename:0:14}"
    
    # Skip the baseline migration itself
    if [ "$timestamp" = "$BASELINE_TIMESTAMP" ]; then
        continue
    fi
    
    # If the timestamp is less than the baseline, move it to archive
    if [ "$timestamp" \< "$BASELINE_TIMESTAMP" ]; then
        echo "Archiving $filename"
        mv "$file" "$ARCHIVE_DIR/"
    fi
done

echo "Migration archival complete. Check $ARCHIVE_DIR for archived files."
