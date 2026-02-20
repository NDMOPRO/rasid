# حل مشكلة "This branch has conflicts that must be resolved"

إذا ظهر في GitHub أن الفرع فيه تعارضات (مثل:
`drizzle/0002_smart_monitor_requirements.sql` و `drizzle/schema.ts` و `server/rasidAI.ts`) اتبع التالي محلياً:

## 1) تحديث الفروع
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
- احتفظ بالمنطق الصحيح من الطرفين عند الحاجة.

## 3) فحص سريع قبل الرفع
```bash
scripts/predeploy-check.sh
```

## 4) إنهاء الدمج
```bash
git add drizzle/0002_smart_monitor_requirements.sql drizzle/schema.ts server/rasidAI.ts
git commit -m "fix: resolve merge conflicts for deployment"
git push origin <your-branch>
```

## ملاحظات مهمة
- ملفا Drizzle (`schema.ts` وملفات migration) غالباً تتكرر فيهما التعارضات؛ يفضل توليد migration جديد بعد الدمج إذا لزم.
- لا تضغط Merge في GitHub قبل نجاح فحص `predeploy-check.sh`.
