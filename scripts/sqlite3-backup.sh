#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../backups" || exit;
sqlite3 ../database.sqlite ".backup backup-$(date +%Y%m%d).sqlite" >&/dev/null
if [ $? -ne 0 ]; then exit; fi
COUNT=$( find . -name 'backup-*sqlite' | wc -l )
if [ $COUNT -lt 10 ]; then exit; fi
find . -name 'backup-*sqlite' -mtime +7 -delete
