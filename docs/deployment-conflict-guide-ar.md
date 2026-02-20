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

## 3) فحوصات قبل الرفع
```bash
npm run predeploy:check
npm run predeploy:merge-check -- --base origin/<base-branch>
```

> الفحص الأول يتحقق من:
> - وجود ملفات Unmerged في Git.
> - وجود علامات تعارض في **جميع الملفات المتتبعة** بالمستودع (مع استثناء الملفات الثنائية والـ lockfiles).

> الفحص الثاني يتحقق من:
> - هل الدمج مع فرع الأساس (مثل `origin/main`) سيسبب تعارضات أم لا، قبل أن تفتح/تحدّث PR.

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

---

## إذا ما زالت GitHub تعرض Conflicts بعد كل ذلك
نفّذ هذا التسلسل مباشرة:
```bash
git fetch origin
git checkout <your-branch>
git reset --hard origin/<your-branch>
git merge origin/<base-branch>
# حل التعارضات
npm run predeploy:check
npm run predeploy:merge-check -- --base origin/<base-branch>
git add -A
git commit -m "fix: final conflict resolution"
git push origin <your-branch>
```
