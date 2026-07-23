#!/bin/bash

# ==========================================================
# 👀 نظام مراقبة التحديثات التلقائية لمتجر قهوجي ماهر
# ==========================================================

WATCH_FILES=("index.html" "app.js" "style.css")
CHECK_INTERVAL=3
REPO_DIR="/home/modyalhelo/Downloads/Kahwaji-Maher-main"

# Get initial modification times
declare -A LAST_MOD_TIMES
for file in "${WATCH_FILES[@]}"; do
    if [ -f "$REPO_DIR/$file" ]; then
        LAST_MOD_TIMES["$file"]=$(stat -c %Y "$REPO_DIR/$file")
    fi
done

echo "=================================================="
echo "👀 بدء تشغيل مراقب الملفات التلقائي لقهوجي ماهر..."
echo "📂 المجلد المراقب: $REPO_DIR"
echo "⏱️ فحص التغييرات كل: $CHECK_INTERVAL ثوانٍ"
echo "=================================================="

while true; do
    CHANGED=false
    for file in "${WATCH_FILES[@]}"; do
        if [ -f "$REPO_DIR/$file" ]; then
            CURRENT_TIME=$(stat -c %Y "$REPO_DIR/$file")
            if [ "$CURRENT_TIME" -ne "${LAST_MOD_TIMES["$file"]}" ]; then
                echo "⚡ تم رصد تعديل في الملف: $file"
                LAST_MOD_TIMES["$file"]=$CURRENT_TIME
                CHANGED=true
            fi
        fi
    done
    
    if [ "$CHANGED" = true ]; then
        echo "🚀 جاري الرفع التلقائي إلى GitHub..."
        cd "$REPO_DIR" || exit
        git add .
        git commit -m "تحديث تلقائي عبر مراقب الملفات بتاريخ $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo "🎉 تم تحديث الموقع بنجاح على الإنترنت!"
        echo "=================================================="
    fi
    
    sleep $CHECK_INTERVAL
done
