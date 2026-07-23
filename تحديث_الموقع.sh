#!/bin/bash

# Clear terminal screen
clear

echo "============================================="
echo "☕ جاري تحديث متجر قهوجي ماهر على GitHub Pages..."
echo "============================================="
echo ""

# 1. Add all changes
git add .

# 2. Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "ℹ️ لا توجد أي تغييرات جديدة لرفعها. موقعك محدث بالفعل!"
    echo ""
    echo "اضغط على أي مفتاح للإغلاق..."
    read -n 1 -s
    exit 0
fi

# 3. Commit changes
commit_msg="تحديث تلقائي للموقع بتاريخ $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_msg"

# 4. Push to remote GitHub repo
echo "🚀 جاري رفع الملفات إلى GitHub..."
if git push origin main; then
    echo ""
    echo "============================================="
    echo "🎉 تم تحديث الموقع بنجاح على الإنترنت!"
    echo "🔗 الرابط: https://moayad515100-glitch.github.io/Kahwaji-Maher/"
    echo "============================================="
else
    echo ""
    echo "❌ حدث خطأ أثناء رفع التحديثات. يرجى التأكد من اتصال الإنترنت وحالة الرمز السري."
fi

echo ""
echo "اضغط على أي مفتاح للإغلاق..."
read -n 1 -s
