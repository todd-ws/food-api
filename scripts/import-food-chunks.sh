#!/usr/bin/env bash
set -euo pipefail
: "${MONGO_URI:?MONGO_URI environment variable must be set}"
CHUNKS_DIR="data/chunks"
shopt -s nullglob
files=( "$CHUNKS_DIR"/foods_chunk_*.ndjson "$CHUNKS_DIR"/foods_*.ndjson )
if [ ${#files[@]} -eq 0 ]; then echo "No food chunk files in $CHUNKS_DIR"; exit 1; fi
for f in "${files[@]}"; do
  echo "Importing Food chunk $f"
  mongoimport --uri "$MONGO_URI" --collection foundationfoods --type json --file "$f" --mode insert
done
echo "Food import complete"
