# حل مشكلة "This branch has conflicts that must be resolved"

إذا ظهر في GitHub أن الفرع فيه تعارضات (مثل:
`drizzle/0002_smart_monitor_requirements.sql` و `drizzle/schema.ts` و `server/rasidAI.ts`) اتبع التالي محلياً:

## 1) تحديث الفرع من القاعدة
```bash
git fetch origin
git checkout <your-branch>
git merge origin/<base-branch>
```

## 2) حل التعارضات
- افتح كل ملف متعارض واحذف العلامات:
  - `<<<<<<<`
  - `=======`
  - `>>>>>>>`
- احتفظ بالنسخة الصحيحة بعد المراجعة (وليس حذف عشوائي).

## 3) فحص شامل قبل الرفع
```bash
npm run predeploy:check
```

> الفحص يتحقق من:
> - وجود ملفات Unmerged في Git.
> - وجود علامات تعارض في **جميع الملفات المتتبعة** بالمستودع (مع استثناء الملفات الثنائية والـ lockfiles).

## 4) إنهاء الدمج
```bash
git add -A
git commit -m "fix: resolve merge conflicts for deployment"
git push origin <your-branch>
```

## 5) قبل الضغط على Merge في GitHub
- تأكد أن قسم **Conflicts** اختفى.
- تأكد أن الـ **Checks** كلها ✅.
- بعدها اضغط **Merge pull request**.
