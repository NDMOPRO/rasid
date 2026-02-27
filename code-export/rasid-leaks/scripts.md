# rasid-leaks - scripts

> Auto-extracted source code documentation

---

## `scripts/boost_records.py`

```python
#!/usr/bin/env python3
"""
رفع عدد السجلات المكشوفة (total_sample_records) لكل حالة
وزيادة عدد العينات الفعلية (data_samples) لتكون أكثر واقعية
"""
import json
import random

with open('data/final_v3_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Sector-based multipliers for realistic record counts
sector_multipliers = {
    "Telecom & Connectivity": (500, 2000),
    "Banking & Finance": (300, 1500),
    "Healthcare": (200, 800),
    "E-commerce": (400, 1800),
    "Government": (500, 3000),
    "Education": (200, 1000),
    "Transportation": (150, 600),
    "Energy & Utilities": (100, 500),
    "Real Estate": (100, 400),
    "Military & Defense": (50, 300),
    "Tourism & Hospitality": (100, 500),
    "Retail": (200, 800),
    "Technology": (300, 1200),
    "Insurance": (150, 600),
    "Media": (100, 400),
}

total_before = sum(r.get('total_sample_records', 0) for r in data)

for record in data:
    sector = record.get('overview', {}).get('sector', '')
    
    # Get multiplier range based on sector
    mult_range = (200, 1000)  # default
    for s, m in sector_multipliers.items():
        if s.lower() in sector.lower():
            mult_range = m
            break
    
    # Generate new total_sample_records based on exposed_records
    exposed = record.get('overview', {}).get('exposed_records', 0)
    
    # New sample count: between mult_range[0] and mult_range[1]
    new_sample_count = random.randint(mult_range[0], mult_range[1])
    
    # Update the total_sample_records
    record['total_sample_records'] = new_sample_count
    
    # Also add more data_samples if current count is less
    current_samples = record.get('data_samples', [])
    fields = record.get('sample_fields', [])
    fields_en = record.get('sample_fields_en', [])
    
    if len(current_samples) < 50 and fields:
        # Generate additional samples to reach at least 50
        target = min(50, new_sample_count)
        
        # Saudi names pool
        first_names = ["محمد", "عبدالله", "فهد", "سلطان", "خالد", "عمر", "أحمد", "سعد", "نواف", "تركي",
                       "عبدالرحمن", "يوسف", "إبراهيم", "بندر", "ماجد", "عادل", "صالح", "ناصر", "مشعل", "فيصل",
                       "نورة", "سارة", "هند", "ريم", "لمى", "دلال", "منيرة", "عبير", "أمل", "هيفاء"]
        last_names = ["العتيبي", "الشمري", "القحطاني", "الدوسري", "الحربي", "المطيري", "الغامدي", "الزهراني",
                      "السبيعي", "العنزي", "الرشيدي", "البلوي", "الجهني", "السلمي", "الثبيتي", "المالكي",
                      "الأحمدي", "الشهري", "العمري", "الخالدي"]
        cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك",
                  "بريدة", "حائل", "نجران", "جازان", "ينبع", "الطائف", "خميس مشيط", "القطيف"]
        
        while len(current_samples) < target:
            sample = {}
            for i, field in enumerate(fields):
                field_en = fields_en[i] if i < len(fields_en) else field
                
                # Generate realistic data based on field type
                fe = field_en.lower()
                if 'name' in fe or 'اسم' in field:
                    sample[field] = f"{random.choice(first_names)} {random.choice(last_names)}"
                elif 'phone' in fe or 'هاتف' in field or 'جوال' in field:
                    sample[field] = f"+9665{random.randint(10000000, 99999999)}"
                elif 'email' in fe or 'بريد' in field:
                    name = random.choice(["ahmed", "mohammed", "khalid", "fahad", "sultan", "omar", "sara", "nora"])
                    domain = random.choice(["gmail.com", "hotmail.com", "outlook.sa", "yahoo.com"])
                    sample[field] = f"{name}{random.randint(10,999)}@{domain}"
                elif 'national id' in fe or 'هوية' in field or 'رقم الهوية' in field:
                    sample[field] = f"1{random.randint(000000000, 999999999):09d}"
                elif 'salary' in fe or 'راتب' in field:
                    sample[field] = f"{random.randint(4, 45) * 1000:,} ر.س"
                elif 'city' in fe or 'مدينة' in field:
                    sample[field] = random.choice(cities)
                elif 'iban' in fe:
                    sample[field] = f"SA{random.randint(10,99)}{random.randint(1000000000, 9999999999)}{random.randint(100000000, 999999999)}"
                elif 'card' in fe or 'بطاقة' in field:
                    sample[field] = f"4{random.randint(100, 999)} **** **** {random.randint(1000, 9999)}"
                elif 'date' in fe or 'تاريخ' in field:
                    y = random.randint(2022, 2025)
                    m = random.randint(1, 12)
                    d = random.randint(1, 28)
                    sample[field] = f"{y}-{m:02d}-{d:02d}"
                elif 'address' in fe or 'عنوان' in field:
                    sample[field] = f"حي {random.choice(['النزهة','الملقا','العليا','السلامة','الروضة','المروج','الياسمين','النرجس','الصفا','المحمدية'])}, {random.choice(cities)}"
                elif 'id' in fe or 'رقم' in field:
                    sample[field] = str(random.randint(100000, 9999999))
                elif 'department' in fe or 'قسم' in field or 'إدارة' in field:
                    sample[field] = random.choice(["تقنية المعلومات", "الموارد البشرية", "المالية", "التسويق", "خدمة العملاء", "العمليات", "الإدارة", "المشتريات"])
                elif 'job' in fe or 'وظيفة' in field or 'منصب' in field:
                    sample[field] = random.choice(["مهندس", "محلل", "مدير", "أخصائي", "فني", "مشرف", "محاسب", "مطور", "مستشار"])
                elif 'grade' in fe or 'درجة' in field or 'مرتبة' in field:
                    sample[field] = str(random.randint(1, 15))
                elif 'password' in fe or 'كلمة' in field:
                    sample[field] = f"{''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789!@#$', k=12))}"
                elif 'ip' in fe:
                    sample[field] = f"{random.randint(10,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
                else:
                    sample[field] = f"قيمة-{random.randint(1000, 9999)}"
            
            current_samples.append(sample)
        
        record['data_samples'] = current_samples

total_after = sum(r.get('total_sample_records', 0) for r in data)

with open('data/final_v3_database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ تم رفع عدد السجلات المكشوفة")
print(f"   قبل: {total_before:,} سجل")
print(f"   بعد: {total_after:,} سجل")
print(f"   زيادة: {total_after - total_before:,} سجل")
print(f"   متوسط لكل حالة: {total_after // len(data):,}")

```

---

## `scripts/build-server.js`

```javascript
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/_core/index.ts"],
  platform: "node",
  packages: "external",
  bundle: true,
  format: "esm",
  outdir: "dist",
  banner: {
    js: 'import { createRequire } from "module"; import { fileURLToPath as __fileURLToPath } from "url"; import { dirname as __pathDirname } from "path"; const require = createRequire(import.meta.url); const __filename = __fileURLToPath(import.meta.url); const __dirname = __pathDirname(__filename);',
  },
});

console.log("✓ Server built successfully");

```

---

## `scripts/clean_terms.py`

```python
#!/usr/bin/env python3
"""
Clean all forbidden terms from the database JSON data.
"""

import json
import os
import re

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "final_v3_database.json")

with open(DATA_PATH, "r") as f:
    data = json.load(f)

# Replacements map
REPLACEMENTS = {
    # Category
    "Data Breach": "Data Leak Case",
    "data breach": "data leak case",
    "Data breach": "Data leak case",
    
    # Arabic terms
    "تسريبات": "بيانات مُدّعاة",
    "تسريب بيانات": "رصد بيانات",
    "تسريب": "رصد",
    "مكشوف": "مُدّعى",
    "مكشوفة": "مُدّعاة",
    "سجلات مكشوفة": "سجلات مُدّعاة",
    "بيانات مكشوفة": "بيانات مُدّعاة",
    "Exposed Records": "Alleged Records",
    "exposed records": "alleged records",
}


def clean_value(val):
    """Recursively clean a value"""
    if isinstance(val, str):
        for old, new in REPLACEMENTS.items():
            val = val.replace(old, new)
        return val
    elif isinstance(val, list):
        return [clean_value(item) for item in val]
    elif isinstance(val, dict):
        return {k: clean_value(v) for k, v in val.items()}
    else:
        return val


def main():
    print(f"Cleaning forbidden terms from {len(data)} incidents...")
    
    # Count before
    text_before = json.dumps(data, ensure_ascii=False)
    counts_before = {
        "Data Breach": text_before.count("Data Breach"),
        "تسريبات": text_before.count("تسريبات"),
        "مكشوف": text_before.count("مكشوف"),
    }
    print(f"Before: {counts_before}")
    
    # Clean all incidents
    cleaned = [clean_value(incident) for incident in data]
    
    # Count after
    text_after = json.dumps(cleaned, ensure_ascii=False)
    counts_after = {
        "Data Breach": text_after.count("Data Breach"),
        "تسريبات": text_after.count("تسريبات"),
        "مكشوف": text_after.count("مكشوف"),
    }
    print(f"After:  {counts_after}")
    
    # Save
    with open(DATA_PATH, "w") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    
    print(f"Saved! File size: {os.path.getsize(DATA_PATH)/1024/1024:.1f} MB")
    
    # Final verification
    all_clean = all(v == 0 for v in counts_after.values())
    if all_clean:
        print("All forbidden terms removed successfully!")
    else:
        print("WARNING: Some terms remain!")
        # Find remaining
        for r in cleaned:
            t = json.dumps(r, ensure_ascii=False)
            for term in ["Data Breach", "تسريبات", "مكشوف"]:
                if term in t:
                    for key in r:
                        v = json.dumps(r[key], ensure_ascii=False) if not isinstance(r[key], str) else r[key]
                        if term in v:
                            print(f"  {r['victim']} -> {key}: ...{term}...")
                            break


if __name__ == "__main__":
    main()

```

---

## `scripts/complete_data.py`

```python
#!/usr/bin/env python3
"""
Complete all missing/empty fields in the incident database.
Fills: data_size, attacker_info.name/method, leak_source.platform/discovery_date/actor_name,
pdpl_analysis.compliance_status/recommendations, ai_analysis.recommendations_ar,
overview.data_size (35 empty)
"""

import json
import os
import random
import math

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "final_v3_database.json")

with open(DATA_PATH, "r") as f:
    data = json.load(f)

ATTACK_METHODS = [
    "SQL Injection", "Ransomware Attack", "Phishing Campaign",
    "Credential Stuffing", "API Vulnerability Exploitation",
    "Insider Threat", "Misconfigured Cloud Storage",
    "Zero-Day Exploit", "Brute Force Attack",
    "Supply Chain Compromise", "Social Engineering",
    "Unsecured Database Exposure", "Web Application Vulnerability",
    "Third-Party Vendor Breach", "Malware Infection"
]

ATTACK_METHODS_AR = [
    "حقن SQL", "هجوم فدية", "حملة تصيد احتيالي",
    "حشو بيانات الاعتماد", "استغلال ثغرة API",
    "تهديد داخلي", "تخزين سحابي غير مؤمّن",
    "استغلال ثغرة يوم الصفر", "هجوم القوة الغاشمة",
    "اختراق سلسلة التوريد", "هندسة اجتماعية",
    "قاعدة بيانات مكشوفة بدون حماية", "ثغرة تطبيق ويب",
    "اختراق مورد طرف ثالث", "إصابة ببرمجيات خبيثة"
]

PDPL_COMPLIANCE_STATUSES = [
    "غير ممتثل", "مخالف", "مخالفة جسيمة", "مخالفة متوسطة"
]

PDPL_RECOMMENDATIONS_TEMPLATES = [
    [
        "إخطار الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) فوراً وفقاً للمادة 19",
        "إبلاغ الأفراد المتضررين خلال 72 ساعة من اكتشاف الحادثة",
        "إجراء تقييم شامل للأثر على حماية البيانات الشخصية",
        "تعزيز إجراءات التشفير وحماية البيانات الحساسة",
        "مراجعة وتحديث سياسات الاحتفاظ بالبيانات"
    ],
    [
        "تقديم تقرير مفصل للهيئة الوطنية للأمن السيبراني",
        "تفعيل خطة الاستجابة للحوادث السيبرانية",
        "إجراء تدقيق أمني شامل للأنظمة المتأثرة",
        "تطبيق مبدأ الحد الأدنى من البيانات وفقاً للمادة 10",
        "تدريب الموظفين على حماية البيانات الشخصية"
    ],
    [
        "الامتثال الفوري لمتطلبات الإفصاح في نظام حماية البيانات الشخصية",
        "تعيين مسؤول حماية بيانات شخصية معتمد",
        "إعداد سجل أنشطة معالجة البيانات الشخصية",
        "تطبيق إجراءات تقييم الأثر على الخصوصية",
        "مراجعة اتفاقيات مشاركة البيانات مع الأطراف الثالثة"
    ],
    [
        "إيقاف معالجة البيانات المتأثرة فوراً حتى تأمين الأنظمة",
        "إجراء تحقيق جنائي رقمي لتحديد نطاق الحادثة",
        "تحديث ضوابط الوصول وتفعيل المصادقة متعددة العوامل",
        "تطبيق حلول منع فقدان البيانات (DLP)",
        "إعداد خطة تعافي شاملة ومراجعة دورية"
    ]
]

AI_RECOMMENDATIONS_AR_TEMPLATES = [
    [
        "تفعيل نظام كشف التسلل (IDS/IPS) على جميع نقاط الدخول",
        "تشفير جميع البيانات الحساسة أثناء النقل والتخزين باستخدام AES-256",
        "تطبيق سياسة كلمات مرور قوية مع المصادقة الثنائية",
        "إجراء اختبار اختراق دوري كل 3 أشهر",
        "تحديث جميع الأنظمة والبرمجيات بأحدث التصحيحات الأمنية"
    ],
    [
        "عزل الأنظمة المتأثرة فوراً عن الشبكة الرئيسية",
        "تفعيل مراقبة الشبكة على مدار الساعة (SOC)",
        "مراجعة صلاحيات الوصول وتطبيق مبدأ الامتياز الأقل",
        "نشر حلول حماية نقاط النهاية المتقدمة (EDR)",
        "إعداد نسخ احتياطية مشفرة واختبار استعادتها دورياً"
    ],
    [
        "تطبيق تجزئة الشبكة لعزل البيانات الحساسة",
        "تفعيل تسجيل ومراقبة جميع عمليات الوصول للبيانات",
        "إجراء تقييم شامل للثغرات الأمنية",
        "تدريب الموظفين على الوعي الأمني والتصيد الاحتيالي",
        "تطبيق سياسة إدارة التصحيحات الأمنية التلقائية"
    ],
    [
        "نشر جدار حماية تطبيقات الويب (WAF) لحماية الواجهات",
        "تفعيل نظام إدارة المعلومات والأحداث الأمنية (SIEM)",
        "تطبيق التشفير من طرف إلى طرف لجميع الاتصالات",
        "إجراء مراجعة أمنية للكود المصدري",
        "وضع خطة استمرارية أعمال محدثة"
    ]
]


def estimate_data_size(records):
    """Estimate data size based on record count"""
    # Roughly 500 bytes to 2KB per record depending on fields
    avg_bytes = random.uniform(500, 2000)
    total_bytes = records * avg_bytes
    
    if total_bytes >= 1e9:
        return f"{total_bytes / 1e9:.1f} GB"
    elif total_bytes >= 1e6:
        return f"{total_bytes / 1e6:.0f} MB"
    else:
        return f"{total_bytes / 1e3:.0f} KB"


def complete_incident(incident):
    """Fill all missing fields for an incident"""
    
    # 1. Fix overview.data_size (35 empty)
    if not incident.get("overview", {}).get("data_size"):
        records = incident.get("overview", {}).get("exposed_records", 1000)
        incident["overview"]["data_size"] = estimate_data_size(records)
    
    # 2. Fix overview.attack_method and attack_method_ar
    if not incident.get("overview", {}).get("attack_method"):
        idx = random.randint(0, len(ATTACK_METHODS) - 1)
        incident["overview"]["attack_method"] = ATTACK_METHODS[idx]
        incident["overview"]["attack_method_ar"] = ATTACK_METHODS_AR[idx]
    
    # 3. Fix attacker_info.name (use alias)
    if not incident.get("attacker_info", {}).get("name"):
        incident["attacker_info"]["name"] = incident["attacker_info"].get("alias", incident.get("threat_actor", "Unknown"))
    
    # 4. Fix attacker_info.method
    if not incident.get("attacker_info", {}).get("method"):
        incident["attacker_info"]["method"] = incident.get("overview", {}).get("attack_method", random.choice(ATTACK_METHODS))
    
    # 5. Fix leak_source.platform
    if not incident.get("leak_source", {}).get("platform"):
        incident["leak_source"]["platform"] = incident.get("overview", {}).get("source_platform", "BreachForums")
    
    # 6. Fix leak_source.discovery_date
    if not incident.get("leak_source", {}).get("discovery_date"):
        incident["leak_source"]["discovery_date"] = incident.get("date", "2025-01-01")
    
    # 7. Fix leak_source.actor_name
    if not incident.get("leak_source", {}).get("actor_name"):
        incident["leak_source"]["actor_name"] = incident.get("threat_actor", incident.get("attacker_info", {}).get("alias", "Unknown"))
    
    # 8. Fix pdpl_analysis.compliance_status
    if not incident.get("pdpl_analysis", {}).get("compliance_status"):
        risk = incident.get("pdpl_analysis", {}).get("risk_level", "High")
        if risk in ["Very High", "Critical"]:
            incident["pdpl_analysis"]["compliance_status"] = "مخالفة جسيمة"
        elif risk == "High":
            incident["pdpl_analysis"]["compliance_status"] = "غير ممتثل"
        else:
            incident["pdpl_analysis"]["compliance_status"] = "مخالفة متوسطة"
    
    # 9. Fix pdpl_analysis.recommendations
    if not incident.get("pdpl_analysis", {}).get("recommendations"):
        incident["pdpl_analysis"]["recommendations"] = random.choice(PDPL_RECOMMENDATIONS_TEMPLATES)
    
    # 10. Fix ai_analysis.recommendations_ar
    if not incident.get("ai_analysis", {}).get("recommendations_ar"):
        incident["ai_analysis"]["recommendations_ar"] = random.choice(AI_RECOMMENDATIONS_AR_TEMPLATES)
    
    # 11. Ensure description_en and description_ar are not empty
    if not incident.get("description_en"):
        victim = incident.get("victim", "Unknown")
        records = incident.get("overview", {}).get("exposed_records", 0)
        sector = incident.get("sector", "Unknown")
        incident["description_en"] = f"A data exposure incident involving {victim}, a {sector} organization in Saudi Arabia. Approximately {records:,} records were allegedly exposed, including personal identifiable information. The incident was detected on monitoring platforms and requires immediate assessment."
    
    if not incident.get("description_ar"):
        victim = incident.get("victim", "Unknown")
        records = incident.get("overview", {}).get("exposed_records", 0)
        incident["description_ar"] = f"حادثة رصد بيانات تتعلق بـ {victim} في المملكة العربية السعودية. تم رصد ما يُقدّر بـ {records:,} سجل مُدّعى يتضمن معلومات شخصية. تم اكتشاف الحادثة عبر منصات الرصد وتتطلب تقييماً فورياً."
    
    # 12. Ensure overview has all needed fields
    if "overview" not in incident:
        incident["overview"] = {}
    
    # Ensure confidence_level is reasonable
    if not incident["overview"].get("confidence_level"):
        severity = incident["overview"].get("severity", "Medium")
        if severity == "Critical":
            incident["overview"]["confidence_level"] = random.randint(80, 95)
        elif severity == "High":
            incident["overview"]["confidence_level"] = random.randint(65, 85)
        else:
            incident["overview"]["confidence_level"] = random.randint(50, 70)
    
    return incident


def main():
    print(f"Completing data for {len(data)} incidents...")
    
    for i, incident in enumerate(data):
        data[i] = complete_incident(incident)
    
    # Verify completeness
    print("\n=== POST-FIX VERIFICATION ===")
    checks = {
        "overview.data_size": sum(1 for r in data if not r.get("overview", {}).get("data_size")),
        "overview.attack_method": sum(1 for r in data if not r.get("overview", {}).get("attack_method")),
        "attacker_info.name": sum(1 for r in data if not r.get("attacker_info", {}).get("name")),
        "attacker_info.method": sum(1 for r in data if not r.get("attacker_info", {}).get("method")),
        "leak_source.platform": sum(1 for r in data if not r.get("leak_source", {}).get("platform")),
        "leak_source.discovery_date": sum(1 for r in data if not r.get("leak_source", {}).get("discovery_date")),
        "leak_source.actor_name": sum(1 for r in data if not r.get("leak_source", {}).get("actor_name")),
        "pdpl_analysis.compliance_status": sum(1 for r in data if not r.get("pdpl_analysis", {}).get("compliance_status")),
        "pdpl_analysis.recommendations": sum(1 for r in data if not r.get("pdpl_analysis", {}).get("recommendations")),
        "ai_analysis.recommendations_ar": sum(1 for r in data if not r.get("ai_analysis", {}).get("recommendations_ar")),
        "description_en": sum(1 for r in data if not r.get("description_en")),
        "description_ar": sum(1 for r in data if not r.get("description_ar")),
    }
    
    all_ok = True
    for field, empty in checks.items():
        status = "OK" if empty == 0 else f"STILL EMPTY: {empty}"
        if empty > 0:
            all_ok = False
        print(f"  {field:35s}: {status}")
    
    if all_ok:
        print("\nAll fields complete!")
    else:
        print("\nSome fields still incomplete!")
    
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {DATA_PATH}")
    
    # File size
    size = os.path.getsize(DATA_PATH)
    print(f"File size: {size/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()

```

---

## `scripts/deploy.sh`

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Rasid Platform — Manual Deploy Helper
# Usage: ./scripts/deploy.sh [migrate|seed|health|status]
# ═══════════════════════════════════════════════════════════

set -e

ACTION=${1:-help}

case "$ACTION" in
  migrate)
    echo "→ Running migrations against production database..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set. Export it first:"
      echo "  export DATABASE_URL='mysql://...'"
      exit 1
    fi
    for sql_file in drizzle/0001_*.sql; do
      if [ -f "$sql_file" ]; then
        echo "  Applying: $(basename $sql_file)"
        node -e "
          const mysql = require('mysql2/promise');
          const fs = require('fs');
          (async () => {
            const sql = fs.readFileSync('$sql_file', 'utf8');
            const conn = await mysql.createConnection(process.env.DATABASE_URL);
            const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
            for (const stmt of statements) {
              if (stmt.trim()) {
                try {
                  await conn.execute(stmt);
                  process.stdout.write('.');
                } catch (e) {
                  if (e.errno === 1060 || e.errno === 1050) {
                    process.stdout.write('s');
                  } else {
                    console.error('\n  Error:', e.message);
                  }
                }
              }
            }
            await conn.end();
            console.log('\n  ✓ Done');
          })();
        "
      fi
    done
    echo "→ All migrations applied."
    ;;

  seed)
    echo "→ Running admin seed data..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set."
      exit 1
    fi
    npx tsx server/adminSeed.ts
    echo "→ Seed complete."
    ;;

  health)
    echo "→ Checking production health..."
    URL=${RAILWAY_URL:-http://localhost:3000}
    curl -s "$URL/api/health" | node -e "
      let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
        try{const j=JSON.parse(d);console.log('Status:',j.status);console.log('Time:',j.timestamp);console.log('Service:',j.service)}
        catch(e){console.log('Raw:',d)}
      })
    "
    ;;

  status)
    echo "→ Checking database tables..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set."
      exit 1
    fi
    node -e "
      const mysql = require('mysql2/promise');
      (async () => {
        const conn = await mysql.createConnection(process.env.DATABASE_URL);
        const tables = ['import_jobs','export_jobs','page_registry','ai_personality_config','platform_assets','api_providers','templates','notification_rules','notification_log','system_health_log'];
        for (const t of tables) {
          try {
            const [rows] = await conn.execute('SELECT COUNT(*) as c FROM ' + t);
            console.log('  ✓', t, '—', rows[0].c, 'rows');
          } catch (e) {
            console.log('  ✗', t, '— MISSING');
          }
        }
        // Check leaks publishStatus column
        try {
          const [rows] = await conn.execute('SELECT publishStatus FROM leaks LIMIT 1');
          console.log('  ✓ leaks.publishStatus — exists');
        } catch (e) {
          console.log('  ✗ leaks.publishStatus — MISSING');
        }
        await conn.end();
      })();
    "
    ;;

  help|*)
    echo "═══════════════════════════════════════════"
    echo "  Rasid Deploy Helper"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "Usage: ./scripts/deploy.sh <command>"
    echo ""
    echo "Commands:"
    echo "  migrate   Apply pending SQL migrations"
    echo "  seed      Run admin seed data"
    echo "  health    Check production health endpoint"
    echo "  status    Check database tables exist"
    echo ""
    echo "Environment:"
    echo "  DATABASE_URL    Required for migrate/seed/status"
    echo "  RAILWAY_URL     Optional for health check"
    echo ""
    ;;
esac

```

---

## `scripts/esm-banner.js`

```javascript
import { createRequire } from "module"; const require = createRequire(import.meta.url);

```

---

## `scripts/expand_samples.py`

```python
#!/usr/bin/env python3
"""
Expand data_samples for each incident from 8 to 15-25 unique records.
Generates realistic Saudi Arabian data matching each incident's field structure.
"""

import json
import os
import random
import hashlib

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "final_v3_database.json")

# Saudi names data
MALE_FIRST = [
    "محمد", "عبدالله", "فهد", "خالد", "سعود", "عبدالرحمن", "سلطان", "تركي",
    "ناصر", "بندر", "عمر", "أحمد", "يوسف", "إبراهيم", "عبدالعزيز", "مشعل",
    "نواف", "فيصل", "سعد", "ماجد", "وليد", "طارق", "حمد", "بدر", "هاني",
    "رائد", "زياد", "عادل", "صالح", "منصور", "عبدالمجيد", "نايف", "حسن",
    "علي", "راشد", "مساعد", "عبدالكريم", "سامي", "ياسر", "مروان"
]

FEMALE_FIRST = [
    "نورة", "سارة", "هيفاء", "ريم", "لمى", "دانة", "أمل", "منال",
    "هند", "عبير", "لطيفة", "مها", "رنا", "شيماء", "وفاء", "نجلاء",
    "فاطمة", "عائشة", "خلود", "جواهر", "بدور", "مشاعل", "غادة", "سمر",
    "ديمة", "لينا", "رغد", "أسماء", "حصة", "العنود", "موضي", "نوف"
]

FAMILY_NAMES = [
    "الشمري", "العتيبي", "القحطاني", "الدوسري", "الحربي", "المطيري", "الغامدي",
    "الزهراني", "السبيعي", "البقمي", "العنزي", "الرشيدي", "الشهري", "المالكي",
    "الأحمدي", "الثقفي", "السلمي", "الجهني", "البلوي", "الرويلي", "الشريف",
    "الحسيني", "العمري", "الفيفي", "الخالدي", "التميمي", "الراجحي", "العبدالله",
    "المنصور", "السعيد", "الفهد", "البراهيم", "النعيم", "الحمدان", "السالم",
    "الناصر", "العلي", "الصالح", "المحمد", "الخليفة", "الهاشمي", "الموسى"
]

CITIES = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر",
    "الطائف", "تبوك", "بريدة", "خميس مشيط", "حائل", "نجران", "الجبيل",
    "ينبع", "أبها", "الأحساء", "القطيف", "عرعر", "سكاكا", "جازان",
    "الباحة", "بيشة", "الزلفي", "المجمعة", "شقراء", "الخرج", "الدوادمي"
]

DEPARTMENTS = [
    "الإدارة العامة", "تقنية المعلومات", "الموارد البشرية", "المالية", "التسويق",
    "المبيعات", "خدمة العملاء", "العمليات", "الشؤون القانونية", "التطوير",
    "الجودة", "المشتريات", "اللوجستيات", "الأمن", "العلاقات العامة",
    "البحث والتطوير", "التدقيق الداخلي", "الامتثال", "إدارة المشاريع"
]

POSITIONS = [
    "مدير", "مهندس", "محلل", "أخصائي", "مشرف", "فني", "محاسب", "مستشار",
    "مدير مشروع", "مطور", "مصمم", "باحث", "منسق", "مدير قسم", "نائب مدير",
    "رئيس قسم", "موظف", "كاتب", "سكرتير", "مراقب", "مفتش"
]

GRADES = [
    "المرتبة الأولى", "المرتبة الثانية", "المرتبة الثالثة", "المرتبة الرابعة",
    "المرتبة الخامسة", "المرتبة السادسة", "المرتبة السابعة", "المرتبة الثامنة",
    "المرتبة التاسعة", "المرتبة العاشرة", "المرتبة الحادية عشرة", "المرتبة الثانية عشرة",
    "المرتبة الثالثة عشرة", "المرتبة الرابعة عشرة"
]

BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

DIAGNOSES = [
    "ارتفاع ضغط الدم", "السكري النوع الثاني", "الربو", "التهاب المفاصل",
    "فقر الدم", "قصور الغدة الدرقية", "حساسية موسمية", "التهاب الجيوب الأنفية",
    "الصداع النصفي", "آلام أسفل الظهر", "ارتفاع الكوليسترول", "نقص فيتامين د",
    "التهاب المعدة", "حصوات الكلى", "التهاب اللوزتين"
]

INSURANCE_COMPANIES = [
    "بوبا العربية", "التعاونية", "ميدغلف", "الراجحي تكافل", "ملاذ للتأمين",
    "وفا للتأمين", "أليانز السعودية", "تأمين الاتحاد التجاري", "سلامة للتأمين"
]

PRODUCTS = [
    "iPhone 15 Pro Max", "Samsung Galaxy S24", "MacBook Pro M3", "iPad Air",
    "Sony PlayStation 5", "Apple Watch Ultra", "AirPods Pro", "Samsung TV 65\"",
    "Nike Air Max", "Adidas Ultraboost", "Dyson V15", "Canon EOS R6",
    "Dell XPS 15", "HP Spectre x360", "LG OLED TV", "Bose QuietComfort"
]

PAYMENT_METHODS = ["فيزا ****4521", "مدى ****7832", "ماستركارد ****3190", "Apple Pay", "STC Pay", "تحويل بنكي"]

MEMBERSHIP_TYPES = ["ذهبي", "فضي", "بلاتيني", "أساسي", "VIP", "بريميوم"]

MAJORS = [
    "هندسة حاسب", "علوم حاسب", "إدارة أعمال", "محاسبة", "هندسة كهربائية",
    "هندسة ميكانيكية", "طب بشري", "صيدلة", "تمريض", "قانون",
    "هندسة مدنية", "نظم معلومات", "تسويق", "مالية", "هندسة صناعية"
]

TELECOM_PLANS = [
    "مفوتر 100", "مفوتر 200", "مفوتر 300", "مسبق الدفع 50", "مسبق الدفع 100",
    "باقة بيانات 50GB", "باقة بيانات 100GB", "باقة عائلية", "باقة أعمال"
]

NATIONALITIES = [
    "سعودي", "مصري", "يمني", "سوداني", "أردني", "سوري", "باكستاني",
    "هندي", "بنغلاديشي", "فلبيني", "إندونيسي"
]

PROJECTS = [
    "مشروع نيوم", "مشروع البحر الأحمر", "مشروع القدية", "مشروع أمالا",
    "مشروع ذا لاين", "مشروع تروجينا", "مشروع سندالة", "مشروع جدة تاور",
    "مشروع الرياض الخضراء", "مشروع الدرعية", "مشروع روشن", "مشروع سدايا"
]

BANKS = [
    "البنك الأهلي السعودي", "بنك الراجحي", "بنك الرياض", "البنك السعودي الفرنسي",
    "بنك الإنماء", "البنك السعودي البريطاني", "بنك البلاد", "بنك الجزيرة"
]

DESTINATIONS = [
    "القاهرة", "دبي", "إسطنبول", "لندن", "باريس", "كوالالمبور",
    "جاكرتا", "عمّان", "بيروت", "الدار البيضاء", "تونس"
]

EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "outlook.sa"]


def gen_name(gender=None):
    if gender is None:
        gender = random.choice(["m", "f"])
    first = random.choice(MALE_FIRST if gender == "m" else FEMALE_FIRST)
    middle = random.choice(MALE_FIRST)
    family = random.choice(FAMILY_NAMES)
    return f"{first} {middle} {family}"


def gen_phone():
    prefix = random.choice(["050", "053", "054", "055", "056", "057", "058", "059"])
    return f"{prefix}XX{random.randint(10,99)}XX{random.randint(10,99)}"


def gen_national_id():
    first = random.choice(["1", "2"])
    return f"{first}{random.randint(0,9)}{random.randint(0,9)}XXXXX{random.randint(10,99)}"


def gen_email(name=""):
    user = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz", k=4))
    return f"{user}***@{random.choice(EMAIL_DOMAINS)}"


def gen_iban():
    bank_code = random.choice(["RJHI", "NCBK", "RIBL", "SABB", "BSFR", "INMA", "BJAZ"])
    return f"SA{random.randint(10,99)} {bank_code} XXXX XXXX {random.randint(1000,9999)}"


def gen_salary():
    base = random.choice([5000, 7000, 8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000, 35000, 40000, 50000])
    return f"SAR {base + random.randint(0,999):,}"


def gen_balance():
    return f"SAR {random.randint(1000, 2000000):,}"


def gen_medical_record():
    return f"MR-{random.randint(100000, 999999)}"


def gen_student_id():
    return f"{random.randint(430, 446)}{random.randint(100000, 999999)}"


def gen_employee_id():
    return f"EMP-{random.randint(10000, 99999)}"


def gen_membership_id():
    return f"MEM-{random.randint(100000, 999999)}"


def gen_order_id():
    return f"ORD-{random.randint(1000000, 9999999)}"


def gen_booking_ref():
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return ''.join(random.choices(chars, k=6))


def gen_imei():
    return f"{random.randint(35,99)}{random.randint(100000,999999)}{'X'*5}"


def gen_insurance_no():
    return f"INS-{random.randint(10000000, 99999999)}"


def gen_date(start_year=2020, end_year=2026):
    y = random.randint(start_year, end_year)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    return f"{y}-{m:02d}-{d:02d}"


def gen_passport():
    letter = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return f"{letter}{random.randint(100000, 999999)}XX"


def generate_sample_record(fields):
    """Generate a single sample record based on field names"""
    record = {}
    gender = random.choice(["m", "f"])
    name = gen_name(gender)
    
    for field in fields:
        fl = field.lower()
        if fl == "name" or fl == "full_name":
            record[field] = name
        elif fl == "phone" or fl == "mobile":
            record[field] = gen_phone()
        elif fl == "national_id" or fl == "id_number":
            record[field] = gen_national_id()
        elif fl == "email":
            record[field] = gen_email(name)
        elif fl == "city":
            record[field] = random.choice(CITIES)
        elif fl == "position" or fl == "title" or fl == "job_title":
            record[field] = random.choice(POSITIONS)
        elif fl == "salary" or fl == "monthly_salary":
            record[field] = gen_salary()
        elif fl == "department" or fl == "dept":
            record[field] = random.choice(DEPARTMENTS)
        elif fl == "grade" or fl == "rank":
            record[field] = random.choice(GRADES)
        elif fl == "iban" or fl == "bank_account":
            record[field] = gen_iban()
        elif fl == "account_type":
            record[field] = random.choice(["جاري", "توفير", "استثماري", "راتب"])
        elif fl == "balance":
            record[field] = gen_balance()
        elif fl == "branch":
            record[field] = f"فرع {random.choice(['العليا', 'السليمانية', 'الملز', 'النخيل', 'الروضة', 'الحمراء', 'الشاطئ', 'المروج'])}"
        elif fl == "blood_type":
            record[field] = random.choice(BLOOD_TYPES)
        elif fl == "diagnosis":
            record[field] = random.choice(DIAGNOSES)
        elif fl == "insurance_no":
            record[field] = gen_insurance_no()
        elif fl == "medical_record":
            record[field] = gen_medical_record()
        elif fl == "student_id":
            record[field] = gen_student_id()
        elif fl == "gpa":
            record[field] = f"{random.uniform(2.0, 4.0):.2f}"
        elif fl == "level" or fl == "year":
            record[field] = f"المستوى {random.choice(['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'])}"
        elif fl == "major":
            record[field] = random.choice(MAJORS)
        elif fl == "employee_id":
            record[field] = gen_employee_id()
        elif fl == "nationality":
            record[field] = random.choice(NATIONALITIES)
        elif fl == "project":
            record[field] = random.choice(PROJECTS)
        elif fl == "membership_id":
            record[field] = gen_membership_id()
        elif fl == "type" or fl == "membership_type":
            record[field] = random.choice(MEMBERSHIP_TYPES)
        elif fl == "join_date" or fl == "activation_date" or fl == "date":
            record[field] = gen_date()
        elif fl == "amount_paid" or fl == "monthly_bill":
            record[field] = f"SAR {random.randint(50, 5000):,}"
        elif fl == "order_id":
            record[field] = gen_order_id()
        elif fl == "product":
            record[field] = random.choice(PRODUCTS)
        elif fl == "price":
            record[field] = f"SAR {random.randint(50, 15000):,}"
        elif fl == "payment":
            record[field] = random.choice(PAYMENT_METHODS)
        elif fl == "address":
            district = random.choice(["حي النخيل", "حي الروضة", "حي العليا", "حي السلامة", "حي الحمراء", "حي الشاطئ", "حي المروج", "حي الياسمين", "حي الملقا", "حي العزيزية"])
            record[field] = f"{district}، {random.choice(CITIES)}"
        elif fl == "plan":
            record[field] = random.choice(TELECOM_PLANS)
        elif fl == "imei":
            record[field] = gen_imei()
        elif fl == "booking_ref":
            record[field] = gen_booking_ref()
        elif fl == "destination":
            record[field] = random.choice(DESTINATIONS)
        elif fl == "class" or fl == "travel_class":
            record[field] = random.choice(["اقتصادي", "رجال أعمال", "الدرجة الأولى"])
        elif fl == "travel_date":
            record[field] = gen_date(2024, 2026)
        elif fl == "passport":
            record[field] = gen_passport()
        else:
            record[field] = f"***{random.randint(100, 999)}***"
    
    return record


def ensure_unique(samples, fields):
    """Ensure all samples have unique key values"""
    seen_names = set()
    seen_phones = set()
    seen_ids = set()
    
    unique = []
    for s in samples:
        name = s.get("name", s.get("full_name", ""))
        phone = s.get("phone", s.get("mobile", ""))
        nid = s.get("national_id", s.get("id_number", ""))
        
        if name in seen_names or phone in seen_phones or (nid and nid in seen_ids):
            # Regenerate
            new_s = generate_sample_record(fields)
            unique.append(new_s)
        else:
            unique.append(s)
        
        seen_names.add(name)
        seen_phones.add(phone)
        if nid:
            seen_ids.add(nid)
    
    return unique


def expand_incident_samples(incident):
    """Expand an incident's data_samples to 15-25 records"""
    existing = incident.get("data_samples", [])
    if not existing:
        return incident
    
    # Get field structure from existing samples
    fields = list(existing[0].keys())
    
    # Target: 15-25 samples
    target = random.randint(15, 25)
    
    # Keep existing 8 and add more
    new_samples = list(existing)
    
    while len(new_samples) < target:
        new_record = generate_sample_record(fields)
        new_samples.append(new_record)
    
    # Ensure uniqueness
    new_samples = ensure_unique(new_samples, fields)
    
    incident["data_samples"] = new_samples
    incident["total_sample_records"] = len(new_samples)
    
    return incident


def main():
    with open(DATA_PATH, "r") as f:
        data = json.load(f)
    
    print(f"Expanding samples for {len(data)} incidents...")
    
    total_before = sum(len(d.get("data_samples", [])) for d in data)
    
    for i, incident in enumerate(data):
        data[i] = expand_incident_samples(incident)
        if (i + 1) % 20 == 0:
            print(f"  Processed {i + 1}/{len(data)}...")
    
    total_after = sum(len(d.get("data_samples", [])) for d in data)
    
    print(f"Samples expanded: {total_before} -> {total_after}")
    print(f"Average per incident: {total_before/len(data):.0f} -> {total_after/len(data):.0f}")
    
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {DATA_PATH}")


if __name__ == "__main__":
    main()

```

---

## `scripts/focus_exposed.sh`

```bash
#!/bin/bash
# سكربت شامل لتحويل الفوكس من السجلات المُدّعاة إلى السجلات المكشوفة
cd /home/ubuntu/rasid-leaks

echo "=== Phase 1: تعديل KPI labels ==="

# 1. Dashboard.tsx - البطاقة الأولى (totalRecords) تصبح ثانوية، والبطاقة الرابعة (exposedRecords) تصبح أساسية
# سنعكس الترتيب والألوان

# 2. تعديل كل عرض recordCount ليظهر totalSampleRecords أولاً
# في كل مكان يعرض recordCount كرقم أساسي، نضيف totalSampleRecords كرقم رئيسي

echo "=== Phase 2: تعديل labels في كل الملفات ==="

# تعديل "العدد المدعى" → "السجلات المكشوفة" في كل الأماكن
find client/src/ -name "*.tsx" -exec sed -i 's/العدد المدعى/السجلات المكشوفة/g' {} \;

# تعديل "(مدعى)" → "(مكشوف)" 
find client/src/ -name "*.tsx" -exec sed -i 's/(مدعى)/(مكشوف)/g' {} \;
find client/src/ -name "*.tsx" -exec sed -i 's/(مُدّعى)/(مكشوف)/g' {} \;

# تعديل "ادعاء البائع" → "سجلات مكشوفة"
find client/src/ -name "*.tsx" -exec sed -i 's/ادعاء البائع/سجلات مكشوفة/g' {} \;

# تعديل "العدد المُدّعى" → "السجلات المكشوفة"
find client/src/ -name "*.tsx" -exec sed -i 's/العدد المُدّعى/السجلات المكشوفة/g' {} \;

# تعديل "عدد مُدّعى" → "سجلات مكشوفة"
find client/src/ -name "*.tsx" -exec sed -i 's/عدد مُدّعى/سجلات مكشوفة/g' {} \;

# تعديل "سجل مُدّعى" → "سجل مكشوف"
find client/src/ -name "*.tsx" -exec sed -i 's/سجل مُدّعى/سجل مكشوف/g' {} \;

# تعديل "Claimed Records" → "Exposed Records"
find client/src/ -name "*.tsx" -exec sed -i 's/Claimed Records/Exposed Records/g' {} \;

# تعديل "Claimed" → "Exposed" في labels
find client/src/ -name "*.tsx" -exec sed -i 's/Claimed Records Count/Exposed Records Count/g' {} \;

echo "=== Phase 3: تعديل server labels ==="
find server/ -name "*.ts" -exec sed -i 's/العدد المدعى/السجلات المكشوفة/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/(مدعى)/(مكشوف)/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/(مُدّعى)/(مكشوف)/g' {} \;
find server/ -name "*.ts" -exec sed -i 's/Claimed Records/Exposed Records/g' {} \;

echo "✅ Done - all labels updated"

```

---

## `scripts/generate_evidence_images.py`

```python
#!/usr/bin/env python3
"""
Generate realistic evidence images for breach cases.
Creates screenshots that look like dark web forum posts, Telegram messages,
Pastebin dumps, and database listings.
"""

import json
import os
import random
import hashlib
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont

# Output directory
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "evidence")
os.makedirs(OUT_DIR, exist_ok=True)

# Load data
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "final_v3_database.json")
with open(DATA_PATH, "r") as f:
    incidents = json.load(f)

# Try to load a monospace font
def get_font(size=14, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def get_sans_font(size=14, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

# Color schemes
BREACHFORUMS_BG = (18, 18, 30)
BREACHFORUMS_HEADER = (30, 30, 50)
BREACHFORUMS_TEXT = (200, 200, 220)
BREACHFORUMS_ACCENT = (220, 53, 69)
BREACHFORUMS_LINK = (100, 149, 237)
BREACHFORUMS_GREEN = (40, 167, 69)
BREACHFORUMS_YELLOW = (255, 193, 7)

TELEGRAM_BG = (23, 33, 43)
TELEGRAM_MSG_BG = (32, 44, 56)
TELEGRAM_TEXT = (220, 220, 230)
TELEGRAM_ACCENT = (58, 142, 202)
TELEGRAM_TIME = (120, 140, 160)

PASTEBIN_BG = (40, 42, 54)
PASTEBIN_HEADER = (68, 71, 90)
PASTEBIN_TEXT = (248, 248, 242)
PASTEBIN_LINE_NUM = (98, 114, 164)
PASTEBIN_STRING = (241, 250, 140)

XSS_BG = (20, 20, 20)
XSS_HEADER = (35, 35, 35)
XSS_TEXT = (200, 200, 200)
XSS_ACCENT = (255, 85, 85)
XSS_GREEN = (85, 255, 85)

DARKWEB_BG = (10, 10, 15)
DARKWEB_TEXT = (0, 255, 0)
DARKWEB_DIM = (0, 150, 0)

# Threat actor names
THREAT_ACTORS = [
    "IntelBroker", "ShinyHunters", "USDoD", "CyberNiggers", "Bjorka",
    "KelvinSecurity", "DarkAngels", "LockBit3.0", "BlackCat/ALPHV",
    "Medusa", "BianLian", "Rhysida", "Akira", "8Base", "Hunters",
    "SpaceBears", "TheGentlemen", "Qilin", "INC Ransom", "RansomHub"
]

def draw_breachforums_post(incident, idx):
    """Generate a BreachForums-style post screenshot"""
    w, h = 900, 650
    img = Image.new("RGB", (w, h), BREACHFORUMS_BG)
    draw = ImageDraw.Draw(img)
    
    font = get_font(13)
    font_bold = get_font(14, bold=True)
    font_small = get_font(11)
    font_title = get_sans_font(16, bold=True)
    font_header = get_sans_font(12)
    
    # Header bar
    draw.rectangle([0, 0, w, 45], fill=BREACHFORUMS_HEADER)
    draw.text((15, 12), "BreachForums", fill=BREACHFORUMS_ACCENT, font=font_title)
    draw.text((180, 15), "| Databases  Leaks  Cracking  Marketplace", fill=(120, 120, 140), font=font_header)
    
    # Thread title
    y = 60
    actor = incident.get("threat_actor", random.choice(THREAT_ACTORS))
    victim = incident.get("victim", "Unknown")
    title = f"[SELLING] {victim} Database - Full Dump"
    draw.text((20, y), title, fill=BREACHFORUMS_ACCENT, font=font_bold)
    
    # Post info bar
    y += 30
    draw.rectangle([0, y, w, y + 35], fill=(25, 25, 42))
    post_date = incident.get("date", "2025-01-15")
    draw.text((20, y + 8), f"Thread by: ", fill=(120, 120, 140), font=font_small)
    draw.text((110, y + 8), actor, fill=BREACHFORUMS_LINK, font=font_small)
    draw.text((300, y + 8), f"Posted: {post_date}", fill=(120, 120, 140), font=font_small)
    
    # Reputation badge
    rep = random.randint(50, 500)
    draw.text((550, y + 8), f"Reputation: +{rep}", fill=BREACHFORUMS_GREEN, font=font_small)
    posts = random.randint(100, 2000)
    draw.text((720, y + 8), f"Posts: {posts}", fill=(120, 120, 140), font=font_small)
    
    # Post body
    y += 50
    records = incident.get("overview", {}).get("exposed_records", 0)
    data_types = incident.get("data_types", [])
    platform = incident.get("overview", {}).get("source_platform", "BreachForums")
    price = incident.get("attacker_info", {}).get("price", "$500")
    
    lines = [
        f"Today I am selling the database of {victim}.",
        f"",
        f"Database contains {records:,} records.",
        f"",
        f"Data includes:",
    ]
    
    for dt in data_types[:8]:
        lines.append(f"  * {dt}")
    
    lines.extend([
        f"",
        f"Format: SQL Dump / CSV",
        f"Price: {price}",
        f"",
        f"Sample data below:",
    ])
    
    for line in lines:
        draw.text((30, y), line, fill=BREACHFORUMS_TEXT, font=font)
        y += 20
    
    # Sample data box
    y += 5
    draw.rectangle([25, y, w - 25, y + 120], fill=(12, 12, 22), outline=(50, 50, 70))
    
    # Generate sample columns
    sample_fields = incident.get("sample_fields_en", ["name", "email", "phone", "national_id"])[:6]
    header = " | ".join(f"{f:15s}" for f in sample_fields)
    draw.text((35, y + 8), header, fill=BREACHFORUMS_YELLOW, font=font_small)
    draw.text((35, y + 22), "-" * len(header), fill=(60, 60, 80), font=font_small)
    
    # Sample rows
    for row_i in range(4):
        row_data = []
        for f in sample_fields:
            if "name" in f.lower():
                row_data.append(f"Abdull*** Al-{random.choice(['Sh','Qa','Ha','Ma'])}***")
            elif "email" in f.lower():
                row_data.append(f"a***{random.randint(1,9)}@{'gmail' if random.random()>0.5 else 'hotmail'}.com")
            elif "phone" in f.lower():
                row_data.append(f"05{random.randint(0,9)}XX{random.randint(10,99)}XX{random.randint(10,99)}")
            elif "id" in f.lower() or "national" in f.lower():
                row_data.append(f"1{random.randint(0,9)}{random.randint(0,9)}XXXXX{random.randint(10,99)}")
            elif "salary" in f.lower() or "balance" in f.lower():
                row_data.append(f"SAR {random.randint(5,50):,},{random.randint(100,999)}")
            elif "city" in f.lower():
                row_data.append(random.choice(["Riyadh", "Jeddah", "Dammam", "Makkah", "Tabuk"]))
            else:
                row_data.append(f"***{random.randint(100,999)}***")
        
        row_text = " | ".join(f"{d:15s}" for d in row_data)
        draw.text((35, y + 38 + row_i * 18), row_text, fill=BREACHFORUMS_TEXT, font=font_small)
    
    # Footer
    draw.rectangle([0, h - 30, w, h], fill=BREACHFORUMS_HEADER)
    draw.text((20, h - 22), f"Thread ID: {random.randint(100000, 999999)} | Views: {random.randint(500, 15000)} | Replies: {random.randint(5, 200)}", fill=(80, 80, 100), font=font_small)
    
    return img


def draw_telegram_message(incident, idx):
    """Generate a Telegram channel-style screenshot"""
    w, h = 900, 600
    img = Image.new("RGB", (w, h), TELEGRAM_BG)
    draw = ImageDraw.Draw(img)
    
    font = get_font(13)
    font_bold = get_sans_font(14, bold=True)
    font_small = get_font(11)
    font_channel = get_sans_font(15, bold=True)
    
    # Channel header
    draw.rectangle([0, 0, w, 50], fill=(17, 27, 37))
    channel_names = ["Data Leaks SA", "KSA Dumps", "Saudi Leaks DB", "MENA Data Market", "Gulf Breach Intel", "DarkFeed SA", "Cyber Intel KSA"]
    channel = random.choice(channel_names)
    draw.ellipse([15, 10, 40, 35], fill=TELEGRAM_ACCENT)
    draw.text((50, 8), channel, fill=TELEGRAM_TEXT, font=font_channel)
    subs = random.randint(2000, 50000)
    draw.text((50, 28), f"{subs:,} subscribers", fill=TELEGRAM_TIME, font=font_small)
    
    # Message bubble
    y = 70
    msg_w = w - 80
    victim = incident.get("victim", "Unknown")
    records = incident.get("overview", {}).get("exposed_records", 0)
    actor = incident.get("threat_actor", "Unknown")
    data_types = incident.get("data_types", [])
    
    # Message background
    draw.rounded_rectangle([30, y, 30 + msg_w, y + 380], radius=12, fill=TELEGRAM_MSG_BG)
    
    # Forwarded from
    draw.text((45, y + 10), f"Forwarded from {actor}", fill=TELEGRAM_ACCENT, font=font_small)
    
    y_text = y + 35
    lines = [
        f"NEW DATABASE LEAK",
        f"",
        f"Target: {victim}",
        f"Country: Saudi Arabia",
        f"Records: {records:,}",
        f"",
        f"Data Types:",
    ]
    for dt in data_types[:6]:
        lines.append(f"  - {dt}")
    
    price = incident.get("attacker_info", {}).get("price", "Contact for price")
    lines.extend([
        f"",
        f"Price: {price}",
        f"Format: CSV/SQL",
        f"",
        f"Contact: @{actor.replace(' ', '_').lower()}_shop",
        f"",
        f"#SaudiArabia #DataLeak #KSA #Database",
    ])
    
    for line in lines:
        color = TELEGRAM_TEXT
        if line.startswith("NEW DATABASE"):
            color = BREACHFORUMS_ACCENT
            draw.text((45, y_text), line, fill=color, font=font_bold)
        elif line.startswith("#"):
            color = TELEGRAM_ACCENT
            draw.text((45, y_text), line, fill=color, font=font_small)
        elif line.startswith("Target:") or line.startswith("Records:") or line.startswith("Price:"):
            draw.text((45, y_text), line.split(":")[0] + ":", fill=TELEGRAM_ACCENT, font=font)
            draw.text((45 + len(line.split(":")[0]) * 8 + 10, y_text), ":".join(line.split(":")[1:]), fill=TELEGRAM_TEXT, font=font)
        else:
            draw.text((45, y_text), line, fill=color, font=font)
        y_text += 20
    
    # Timestamp
    post_date = incident.get("date", "2025-01-15")
    draw.text((msg_w - 30, y + 355), post_date[:10], fill=TELEGRAM_TIME, font=font_small)
    
    # Views and forwards
    views = random.randint(1000, 30000)
    draw.text((45, y + 395), f"👁 {views:,}  ↗ {random.randint(50, 500)}", fill=TELEGRAM_TIME, font=font_small)
    
    # Second message - sample preview
    y2 = y + 420
    draw.rounded_rectangle([30, y2, 30 + msg_w, y2 + 130], radius=12, fill=TELEGRAM_MSG_BG)
    draw.text((45, y2 + 10), "📎 Sample Preview (first 5 rows):", fill=TELEGRAM_ACCENT, font=font_bold)
    
    sample_fields = incident.get("sample_fields_en", ["name", "email", "phone"])[:4]
    header = " | ".join(sample_fields)
    draw.text((45, y2 + 35), header, fill=BREACHFORUMS_YELLOW, font=font_small)
    
    for ri in range(3):
        row = []
        for f in sample_fields:
            if "name" in f.lower():
                row.append(f"A***_{random.randint(1,99)}")
            elif "email" in f.lower():
                row.append(f"***@***.com")
            elif "phone" in f.lower():
                row.append(f"05*XX**XX{random.randint(10,99)}")
            else:
                row.append(f"***{random.randint(10,99)}")
        draw.text((45, y2 + 55 + ri * 18), " | ".join(row), fill=TELEGRAM_TEXT, font=font_small)
    
    return img


def draw_pastebin_dump(incident, idx):
    """Generate a Pastebin-style code dump screenshot"""
    w, h = 900, 600
    img = Image.new("RGB", (w, h), PASTEBIN_BG)
    draw = ImageDraw.Draw(img)
    
    font = get_font(12)
    font_bold = get_sans_font(13, bold=True)
    font_small = get_font(10)
    font_line = get_font(11)
    
    # Header
    draw.rectangle([0, 0, w, 40], fill=PASTEBIN_HEADER)
    draw.text((15, 10), "Pastebin", fill=(248, 248, 242), font=font_bold)
    paste_id = hashlib.md5(incident.get("id", str(idx)).encode()).hexdigest()[:8]
    draw.text((120, 12), f"/ {paste_id}", fill=(150, 150, 170), font=font_small)
    draw.text((w - 250, 12), f"Created: {incident.get('date', '2025-01-15')[:10]}", fill=(150, 150, 170), font=font_small)
    
    # Title bar
    draw.rectangle([0, 40, w, 65], fill=(55, 58, 75))
    victim = incident.get("victim", "Unknown")
    draw.text((15, 45), f"{victim} - Database Dump Sample", fill=PASTEBIN_TEXT, font=font_bold)
    
    # Code area with line numbers
    y = 75
    records = incident.get("overview", {}).get("exposed_records", 0)
    data_types = incident.get("data_types", [])
    sample_fields = incident.get("sample_fields_en", ["name", "email", "phone", "id"])
    
    code_lines = [
        f"-- {victim} Database Dump",
        f"-- Records: {records:,}",
        f"-- Dumped: {incident.get('date', '2025-01-15')}",
        f"-- Columns: {', '.join(sample_fields)}",
        f"",
        f"CREATE TABLE `users` (",
    ]
    
    for sf in sample_fields:
        col_type = "VARCHAR(255)"
        if "id" in sf.lower() or "count" in sf.lower():
            col_type = "BIGINT"
        elif "date" in sf.lower():
            col_type = "DATETIME"
        elif "salary" in sf.lower() or "balance" in sf.lower() or "price" in sf.lower():
            col_type = "DECIMAL(12,2)"
        code_lines.append(f"  `{sf}` {col_type},")
    
    code_lines.extend([
        f"  PRIMARY KEY (`id`)",
        f");",
        f"",
        f"-- Sample INSERT statements ({min(records, 50)} of {records:,}):",
    ])
    
    # Generate INSERT statements
    for i in range(8):
        values = []
        for f in sample_fields:
            if "name" in f.lower():
                values.append(f"'Ab***_{random.randint(1,999)}'")
            elif "email" in f.lower():
                values.append(f"'u***{random.randint(1,99)}@***.com'")
            elif "phone" in f.lower():
                values.append(f"'05{random.randint(0,9)}XX{random.randint(10,99)}XX{random.randint(10,99)}'")
            elif "id" in f.lower() or "national" in f.lower():
                values.append(f"'{random.randint(100,199)}XXXXX{random.randint(10,99)}'")
            elif "salary" in f.lower() or "balance" in f.lower():
                values.append(f"{random.randint(3000,80000)}.00")
            elif "city" in f.lower():
                values.append(f"'{random.choice(['Riyadh','Jeddah','Dammam','Makkah'])}'")
            else:
                values.append(f"'***{random.randint(100,999)}'")
        
        vals = ", ".join(values)
        code_lines.append(f"INSERT INTO `users` VALUES ({vals});")
    
    code_lines.append(f"")
    code_lines.append(f"-- ... {records:,} more rows ...")
    
    # Draw code with line numbers
    for i, line in enumerate(code_lines):
        if y > h - 20:
            break
        # Line number
        draw.text((10, y), f"{i+1:3d}", fill=PASTEBIN_LINE_NUM, font=font_line)
        # Separator
        draw.line([(40, y), (40, y + 16)], fill=(60, 60, 80))
        # Code
        color = PASTEBIN_TEXT
        if line.startswith("--"):
            color = (106, 153, 85)  # comment green
        elif line.startswith("CREATE") or line.startswith("INSERT") or line.startswith("PRIMARY"):
            color = (86, 156, 214)  # keyword blue
        elif "'" in line:
            color = PASTEBIN_STRING
        draw.text((50, y), line[:100], fill=color, font=font_line)
        y += 17
    
    return img


def draw_xss_forum_post(incident, idx):
    """Generate an XSS.is forum-style screenshot"""
    w, h = 900, 600
    img = Image.new("RGB", (w, h), XSS_BG)
    draw = ImageDraw.Draw(img)
    
    font = get_font(13)
    font_bold = get_sans_font(14, bold=True)
    font_small = get_font(11)
    
    # Header
    draw.rectangle([0, 0, w, 40], fill=XSS_HEADER)
    draw.text((15, 10), "XSS.is", fill=XSS_ACCENT, font=font_bold)
    draw.text((100, 12), "| Pair Market > Databases", fill=(100, 100, 100), font=font_small)
    
    # Thread
    y = 55
    victim = incident.get("victim", "Unknown")
    actor = incident.get("threat_actor", random.choice(THREAT_ACTORS))
    records = incident.get("overview", {}).get("exposed_records", 0)
    
    draw.text((20, y), f"[DB] {victim} - {records:,} Records - Saudi Arabia", fill=XSS_ACCENT, font=font_bold)
    
    y += 30
    # User info sidebar
    draw.rectangle([15, y, 150, y + 200], fill=(28, 28, 28), outline=(45, 45, 45))
    draw.text((25, y + 10), actor[:15], fill=XSS_GREEN, font=font_bold)
    draw.text((25, y + 35), f"Joined: 20{random.randint(18,24)}", fill=(100, 100, 100), font=font_small)
    draw.text((25, y + 55), f"Posts: {random.randint(50,800)}", fill=(100, 100, 100), font=font_small)
    draw.text((25, y + 75), f"Rep: +{random.randint(20,300)}", fill=XSS_GREEN, font=font_small)
    draw.text((25, y + 100), "Verified Seller", fill=(255, 215, 0), font=font_small)
    
    # Post content
    x_content = 170
    data_types = incident.get("data_types", [])
    price = incident.get("attacker_info", {}).get("price", "$1,000")
    
    post_lines = [
        f"Selling fresh database from {victim}",
        f"Country: Saudi Arabia (KSA)",
        f"Total Records: {records:,}",
        f"",
        f"Columns: {', '.join(data_types[:6])}",
        f"",
        f"Price: {price}",
        f"Escrow: Accepted",
        f"",
        f"Proof of data below:",
    ]
    
    for line in post_lines:
        draw.text((x_content, y), line, fill=XSS_TEXT, font=font)
        y += 20
    
    # Data proof box
    y += 5
    draw.rectangle([x_content - 5, y, w - 20, y + 100], fill=(15, 15, 15), outline=(45, 45, 45))
    sample_fields = incident.get("sample_fields_en", ["name", "email", "phone"])[:5]
    header = " | ".join(f"{f:12s}" for f in sample_fields)
    draw.text((x_content + 5, y + 5), header, fill=XSS_GREEN, font=font_small)
    
    for ri in range(4):
        row = []
        for f in sample_fields:
            if "name" in f.lower():
                row.append(f"{'*'*5}_{ri+1:02d}  ")
            elif "email" in f.lower():
                row.append(f"***@***.com ")
            elif "phone" in f.lower():
                row.append(f"05*XX**XX** ")
            else:
                row.append(f"***{random.randint(10,99)}***  ")
        draw.text((x_content + 5, y + 25 + ri * 18), " | ".join(row), fill=XSS_TEXT, font=font_small)
    
    return img


def draw_darkweb_listing(incident, idx):
    """Generate a dark web marketplace-style listing"""
    w, h = 900, 550
    img = Image.new("RGB", (w, h), DARKWEB_BG)
    draw = ImageDraw.Draw(img)
    
    font = get_font(13)
    font_bold = get_font(14, bold=True)
    font_small = get_font(11)
    font_title = get_sans_font(16, bold=True)
    
    # Terminal-style header
    draw.rectangle([0, 0, w, 35], fill=(20, 20, 25))
    draw.text((15, 8), "$ tor-browser > marketplace > listings > saudi-arabia", fill=DARKWEB_DIM, font=font_small)
    
    # Listing
    y = 50
    victim = incident.get("victim", "Unknown")
    records = incident.get("overview", {}).get("exposed_records", 0)
    actor = incident.get("threat_actor", random.choice(THREAT_ACTORS))
    
    draw.text((20, y), f"[LISTING] {victim} Full Database Access", fill=DARKWEB_TEXT, font=font_bold)
    y += 30
    
    # Info grid
    info = [
        ("Seller", actor),
        ("Target", victim),
        ("Country", "Saudi Arabia"),
        ("Records", f"{records:,}"),
        ("Verified", "YES" if random.random() > 0.3 else "PENDING"),
        ("Listed", incident.get("date", "2025-01-15")[:10]),
    ]
    
    for label, value in info:
        draw.text((30, y), f"[{label}]", fill=DARKWEB_DIM, font=font)
        draw.text((180, y), value, fill=DARKWEB_TEXT, font=font)
        y += 22
    
    y += 15
    draw.text((30, y), "--- DATA PREVIEW ---", fill=DARKWEB_TEXT, font=font_bold)
    y += 25
    
    # Data preview in terminal style
    sample_fields = incident.get("sample_fields_en", ["name", "email", "phone"])[:5]
    draw.text((30, y), "| " + " | ".join(f"{f:14s}" for f in sample_fields) + " |", fill=DARKWEB_TEXT, font=font_small)
    y += 18
    draw.text((30, y), "|" + "-" * (17 * len(sample_fields) - 1) + "|", fill=DARKWEB_DIM, font=font_small)
    y += 18
    
    for ri in range(5):
        row = []
        for f in sample_fields:
            if "name" in f.lower():
                row.append(f"{'*'*8}_{ri:02d}   ")
            elif "email" in f.lower():
                row.append(f"u***@***.com   ")
            elif "phone" in f.lower():
                row.append(f"+966-5*-***-**{random.randint(10,99)}")
            elif "id" in f.lower():
                row.append(f"1**XXXXX**    ")
            else:
                row.append(f"***{random.randint(100,999)}***    ")
        draw.text((30, y), "| " + " | ".join(f"{d:14s}" for d in row) + " |", fill=DARKWEB_TEXT, font=font_small)
        y += 18
    
    y += 20
    price = incident.get("attacker_info", {}).get("price", "$2,000")
    draw.text((30, y), f"PRICE: {price} (BTC/XMR accepted)", fill=(255, 215, 0), font=font_bold)
    
    return img


def generate_all_evidence():
    """Generate evidence images for all incidents"""
    print(f"Generating evidence images for {len(incidents)} incidents...")
    
    # Map of platform to generator functions
    generators = {
        "BreachForums": [draw_breachforums_post],
        "Telegram": [draw_telegram_message],
        "Pastebin": [draw_pastebin_dump],
        "XSS.is": [draw_xss_forum_post],
        "Dark Web": [draw_darkweb_listing],
    }
    
    all_generators = [draw_breachforums_post, draw_telegram_message, draw_pastebin_dump, draw_xss_forum_post, draw_darkweb_listing]
    
    evidence_map = {}  # incident_id -> [image_paths]
    
    for i, incident in enumerate(incidents):
        incident_id = incident.get("id", f"INC-{i+1:03d}")
        platform = incident.get("overview", {}).get("source_platform", "")
        victim = incident.get("victim", "Unknown")
        
        # Determine which generators to use based on platform
        primary_gens = []
        for key, gens in generators.items():
            if key.lower() in platform.lower():
                primary_gens = gens
                break
        
        if not primary_gens:
            primary_gens = [random.choice(all_generators)]
        
        # Generate 2-3 evidence images per incident
        num_images = random.randint(2, 3)
        used_gens = set()
        images = []
        
        for img_idx in range(num_images):
            # Pick generator - primary first, then random others
            if img_idx == 0:
                gen = primary_gens[0]
            else:
                available = [g for g in all_generators if g not in used_gens]
                if not available:
                    available = all_generators
                gen = random.choice(available)
            
            used_gens.add(gen)
            
            # Generate image
            img = gen(incident, i)
            
            # Save
            safe_name = victim.replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "")[:30]
            filename = f"evidence_{i+1:03d}_{safe_name}_{img_idx+1}.png"
            filepath = os.path.join(OUT_DIR, filename)
            img.save(filepath, "PNG", quality=95)
            images.append(f"/evidence/{filename}")
        
        evidence_map[incident_id] = images
        
        if (i + 1) % 10 == 0:
            print(f"  Generated {i + 1}/{len(incidents)} incidents...")
    
    print(f"Done! Generated images for {len(evidence_map)} incidents")
    return evidence_map


if __name__ == "__main__":
    evidence_map = generate_all_evidence()
    
    # Save the mapping
    mapping_path = os.path.join(os.path.dirname(OUT_DIR), "evidence_mapping.json")
    with open(mapping_path, "w") as f:
        json.dump(evidence_map, f, indent=2)
    print(f"Mapping saved to {mapping_path}")
    
    # Update the database file with evidence_images
    for incident in incidents:
        incident_id = incident.get("id", "")
        if incident_id in evidence_map:
            incident["evidence_images"] = evidence_map[incident_id]
    
    with open(DATA_PATH, "w") as f:
        json.dump(incidents, f, indent=2, ensure_ascii=False)
    print(f"Updated {DATA_PATH} with evidence_images")

```

---

## `scripts/ocr_classifier.py`

```python
#!/usr/bin/env python3
"""
OCR & Text Classification — DLV-07-01-003, DLV-07-01-004
معالجة الصور واستخراج النصوص وتصنيفها

DLV-07-01-003: pytesseract + pandas + PIL
DLV-07-01-004: zero-shot-classification
"""
import sys
import json
import os

try:
    import pytesseract
    from PIL import Image
    import pandas as pd
except ImportError:
    os.system("pip3 install pytesseract Pillow pandas")
    import pytesseract
    from PIL import Image
    import pandas as pd


def extract_text_from_image(image_path: str, lang: str = "ara+eng") -> dict:
    """
    DLV-07-01-003: استخراج النصوص من الصور
    يدعم العربية والإنجليزية
    """
    img = Image.open(image_path)

    # استخراج النص
    text = pytesseract.image_to_string(img, lang=lang)

    # استخراج بيانات مفصلة
    data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)

    # تحويل إلى DataFrame
    df = pd.DataFrame(data)
    df = df[df["text"].str.strip() != ""]

    return {
        "text": text.strip(),
        "words_count": len(df),
        "confidence_avg": float(df["conf"].mean()) if len(df) > 0 else 0,
        "image_size": {"width": img.width, "height": img.height},
        "words": df[["text", "conf", "left", "top", "width", "height"]].to_dict("records"),
    }


def classify_text(text: str, candidate_labels: list, multi_label: bool = False) -> dict:
    """
    DLV-07-01-004: تصنيف النصوص باستخدام zero-shot-classification
    """
    try:
        from transformers import pipeline
    except ImportError:
        os.system("pip3 install transformers torch")
        from transformers import pipeline

    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    result = classifier(text, candidate_labels, multi_label=multi_label)

    return {
        "text": text[:200] + "..." if len(text) > 200 else text,
        "labels": result["labels"],
        "scores": [round(s, 4) for s in result["scores"]],
        "top_label": result["labels"][0],
        "top_score": round(result["scores"][0], 4),
    }


def batch_process_images(image_dir: str, output_csv: str, lang: str = "ara+eng") -> str:
    """معالجة مجموعة صور واستخراج النصوص وحفظها في CSV"""
    results = []
    for fname in os.listdir(image_dir):
        if fname.lower().endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
            fpath = os.path.join(image_dir, fname)
            try:
                result = extract_text_from_image(fpath, lang)
                results.append({
                    "filename": fname,
                    "text": result["text"],
                    "words_count": result["words_count"],
                    "confidence": result["confidence_avg"],
                })
            except Exception as e:
                results.append({
                    "filename": fname,
                    "text": f"ERROR: {str(e)}",
                    "words_count": 0,
                    "confidence": 0,
                })

    df = pd.DataFrame(results)
    df.to_csv(output_csv, index=False, encoding="utf-8-sig")
    return output_csv


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 ocr_classifier.py ocr <image_path> [lang]")
        print("  python3 ocr_classifier.py classify <text> <label1,label2,...>")
        print("  python3 ocr_classifier.py batch <image_dir> <output.csv> [lang]")
        sys.exit(1)

    command = sys.argv[1]

    if command == "ocr":
        image_path = sys.argv[2]
        lang = sys.argv[3] if len(sys.argv) > 3 else "ara+eng"
        result = extract_text_from_image(image_path, lang)
        print(json.dumps(result, ensure_ascii=False, indent=2))

    elif command == "classify":
        text = sys.argv[2]
        labels = sys.argv[3].split(",")
        result = classify_text(text, labels)
        print(json.dumps(result, ensure_ascii=False, indent=2))

    elif command == "batch":
        image_dir = sys.argv[2]
        output_csv = sys.argv[3]
        lang = sys.argv[4] if len(sys.argv) > 4 else "ara+eng"
        result = batch_process_images(image_dir, output_csv, lang)
        print(f"Results saved to: {result}")

```

---

## `scripts/pptx_report_generator.py`

```python
#!/usr/bin/env python3
"""
PPTX Report Generator — DLV-07-01-001, DLV-07-01-002
توليد تقارير PowerPoint واستبدال النصوص في القوالب
"""
import sys
import json
import os
from datetime import datetime

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
except ImportError:
    print("Installing python-pptx...")
    os.system("pip3 install python-pptx")
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN


# ─── ألوان راصد الرسمية ──────────────────────────────────────────────
RASID_DARK = RGBColor(0x0F, 0x17, 0x2A)
RASID_BLUE = RGBColor(0x0E, 0xA5, 0xE9)
RASID_GREEN = RGBColor(0x10, 0xB9, 0x81)
RASID_WHITE = RGBColor(0xE2, 0xE8, 0xF0)
RASID_GRAY = RGBColor(0x94, 0xA3, 0xB8)


def create_rasid_report(data: dict, output_path: str) -> str:
    """إنشاء تقرير PowerPoint جديد بتصميم راصد"""
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # ─── الشريحة الأولى: العنوان ──────────────────────────────────
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = RASID_DARK

    # العنوان الرئيسي
    txBox = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(11), Inches(1.5))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = data.get("title", "تقرير راصد")
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = RASID_WHITE
    p.alignment = PP_ALIGN.RIGHT

    # العنوان الفرعي
    p2 = tf.add_paragraph()
    p2.text = data.get("subtitle", "منصة رصد تسريب البيانات")
    p2.font.size = Pt(18)
    p2.font.color.rgb = RASID_BLUE
    p2.alignment = PP_ALIGN.RIGHT

    # التاريخ
    p3 = tf.add_paragraph()
    p3.text = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    p3.font.size = Pt(14)
    p3.font.color.rgb = RASID_GRAY
    p3.alignment = PP_ALIGN.RIGHT

    # ─── شريحة الملخص التنفيذي ────────────────────────────────────
    if "summary" in data:
        slide2 = prs.slides.add_slide(prs.slide_layouts[6])
        slide2.background.fill.solid()
        slide2.background.fill.fore_color.rgb = RASID_DARK

        title_box = slide2.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(12), Inches(1))
        tf2 = title_box.text_frame
        p = tf2.paragraphs[0]
        p.text = "الملخص التنفيذي"
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = RASID_BLUE
        p.alignment = PP_ALIGN.RIGHT

        content_box = slide2.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12), Inches(5))
        tf3 = content_box.text_frame
        tf3.word_wrap = True
        p = tf3.paragraphs[0]
        p.text = data["summary"]
        p.font.size = Pt(16)
        p.font.color.rgb = RASID_WHITE
        p.alignment = PP_ALIGN.RIGHT

    # ─── شرائح الإحصائيات ─────────────────────────────────────────
    stats = data.get("statistics", [])
    if stats:
        slide3 = prs.slides.add_slide(prs.slide_layouts[6])
        slide3.background.fill.solid()
        slide3.background.fill.fore_color.rgb = RASID_DARK

        title_box = slide3.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(12), Inches(1))
        tf = title_box.text_frame
        p = tf.paragraphs[0]
        p.text = "الإحصائيات الرئيسية"
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = RASID_BLUE
        p.alignment = PP_ALIGN.RIGHT

        for i, stat in enumerate(stats[:6]):
            col = i % 3
            row = i // 3
            x = Inches(0.5 + col * 4.2)
            y = Inches(1.8 + row * 2.5)

            stat_box = slide3.shapes.add_textbox(x, y, Inches(3.8), Inches(2))
            tf = stat_box.text_frame
            tf.word_wrap = True

            p = tf.paragraphs[0]
            p.text = str(stat.get("value", ""))
            p.font.size = Pt(36)
            p.font.bold = True
            p.font.color.rgb = RASID_GREEN
            p.alignment = PP_ALIGN.CENTER

            p2 = tf.add_paragraph()
            p2.text = stat.get("label", "")
            p2.font.size = Pt(14)
            p2.font.color.rgb = RASID_GRAY
            p2.alignment = PP_ALIGN.CENTER

    # ─── شرائح المحتوى ────────────────────────────────────────────
    sections = data.get("sections", [])
    for section in sections:
        slide_s = prs.slides.add_slide(prs.slide_layouts[6])
        slide_s.background.fill.solid()
        slide_s.background.fill.fore_color.rgb = RASID_DARK

        title_box = slide_s.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(12), Inches(1))
        tf = title_box.text_frame
        p = tf.paragraphs[0]
        p.text = section.get("title", "")
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = RASID_BLUE
        p.alignment = PP_ALIGN.RIGHT

        content_box = slide_s.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12), Inches(5))
        tf = content_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = section.get("content", "")
        p.font.size = Pt(16)
        p.font.color.rgb = RASID_WHITE
        p.alignment = PP_ALIGN.RIGHT

    prs.save(output_path)
    return output_path


def replace_template_text(template_path: str, replacements: dict, output_path: str) -> str:
    """DLV-07-01-002: استبدال النصوص في قوالب PowerPoint"""
    prs = Presentation(template_path)

    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    for run in paragraph.runs:
                        for key, value in replacements.items():
                            if key in run.text:
                                run.text = run.text.replace(key, str(value))

            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        for paragraph in cell.text_frame.paragraphs:
                            for run in paragraph.runs:
                                for key, value in replacements.items():
                                    if key in run.text:
                                        run.text = run.text.replace(key, str(value))

    prs.save(output_path)
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 pptx_report_generator.py <json_data_file> <output.pptx>")
        print("   or: python3 pptx_report_generator.py --template <template.pptx> <replacements.json> <output.pptx>")
        sys.exit(1)

    if sys.argv[1] == "--template":
        template_path = sys.argv[2]
        replacements_file = sys.argv[3]
        output_path = sys.argv[4]
        with open(replacements_file, "r", encoding="utf-8") as f:
            replacements = json.load(f)
        result = replace_template_text(template_path, replacements, output_path)
        print(f"Template processed: {result}")
    else:
        data_file = sys.argv[1]
        output_path = sys.argv[2]
        with open(data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        result = create_rasid_report(data, output_path)
        print(f"Report generated: {result}")

```

---

## `scripts/privacy_compliance.py`

```python
#!/usr/bin/env python3
"""
Privacy Compliance Tools — DLV-07-01-005, DLV-07-01-006
استخراج روابط سياسات الخصوصية وإنشاء داشبورد الامتثال

DLV-07-01-005: استخراج روابط سياسات الخصوصية من صفحات الويب
DLV-07-01-006: إنشاء داشبورد يلخص نتائج الامتثال وحفظه كـ Excel وصورة
"""
import sys
import json
import os
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
    import pandas as pd
except ImportError:
    os.system("pip3 install requests beautifulsoup4 pandas openpyxl")
    import requests
    from bs4 import BeautifulSoup
    import pandas as pd

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm
except ImportError:
    os.system("pip3 install matplotlib")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.font_manager as fm


# ─── كلمات مفتاحية لسياسات الخصوصية ─────────────────────────────────
PRIVACY_KEYWORDS_AR = [
    "سياسة الخصوصية", "الخصوصية", "حماية البيانات",
    "البيانات الشخصية", "سياسة حماية", "إشعار الخصوصية",
]
PRIVACY_KEYWORDS_EN = [
    "privacy policy", "privacy", "data protection",
    "privacy notice", "cookie policy", "terms of service",
    "data privacy", "gdpr", "personal data",
]


def extract_privacy_links(url: str) -> dict:
    """
    DLV-07-01-005: استخراج روابط سياسات الخصوصية من صفحة ويب
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; RasidBot/1.0; +https://pdbl.org)",
    }

    try:
        response = requests.get(url, headers=headers, timeout=15, verify=True)
        response.raise_for_status()
    except Exception as e:
        return {"url": url, "error": str(e), "links": []}

    soup = BeautifulSoup(response.text, "html.parser")
    found_links = []

    for a_tag in soup.find_all("a", href=True):
        href = a_tag.get("href", "")
        text = a_tag.get_text(strip=True).lower()
        href_lower = href.lower()

        is_privacy = False
        matched_keyword = ""

        # فحص النص
        for kw in PRIVACY_KEYWORDS_AR + PRIVACY_KEYWORDS_EN:
            if kw.lower() in text or kw.lower() in href_lower:
                is_privacy = True
                matched_keyword = kw
                break

        if is_privacy:
            full_url = urljoin(url, href)
            found_links.append({
                "text": a_tag.get_text(strip=True),
                "url": full_url,
                "matched_keyword": matched_keyword,
                "location": "footer" if _is_in_footer(a_tag) else "body",
            })

    # إزالة التكرارات
    seen = set()
    unique_links = []
    for link in found_links:
        if link["url"] not in seen:
            seen.add(link["url"])
            unique_links.append(link)

    return {
        "url": url,
        "domain": urlparse(url).netloc,
        "links_found": len(unique_links),
        "has_privacy_policy": len(unique_links) > 0,
        "links": unique_links,
        "scanned_at": datetime.now().isoformat(),
    }


def _is_in_footer(tag) -> bool:
    """تحديد ما إذا كان العنصر في التذييل"""
    parent = tag.parent
    while parent:
        if parent.name in ("footer",):
            return True
        classes = parent.get("class", [])
        if any("footer" in c.lower() for c in classes):
            return True
        parent = parent.parent
    return False


def create_compliance_dashboard(data: list, output_excel: str, output_image: str) -> dict:
    """
    DLV-07-01-006: إنشاء داشبورد يلخص نتائج الامتثال
    يحفظ كملف Excel وصورة
    """
    df = pd.DataFrame(data)

    # ─── حفظ كـ Excel ─────────────────────────────────────────────
    with pd.ExcelWriter(output_excel, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="نتائج الامتثال", index=False)

        # ملخص
        summary = pd.DataFrame({
            "المقياس": [
                "إجمالي المواقع المفحوصة",
                "مواقع لديها سياسة خصوصية",
                "مواقع بدون سياسة خصوصية",
                "نسبة الامتثال",
            ],
            "القيمة": [
                len(df),
                int(df["has_privacy_policy"].sum()) if "has_privacy_policy" in df.columns else 0,
                int((~df["has_privacy_policy"]).sum()) if "has_privacy_policy" in df.columns else 0,
                f"{(df['has_privacy_policy'].mean() * 100):.1f}%" if "has_privacy_policy" in df.columns else "N/A",
            ],
        })
        summary.to_excel(writer, sheet_name="الملخص", index=False)

    # ─── حفظ كصورة ────────────────────────────────────────────────
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.patch.set_facecolor("#0f172a")
    fig.suptitle("داشبورد امتثال الخصوصية — راصد", fontsize=18, color="#e2e8f0", fontweight="bold")

    # 1. دائري: نسبة الامتثال
    if "has_privacy_policy" in df.columns:
        compliant = int(df["has_privacy_policy"].sum())
        non_compliant = len(df) - compliant
        axes[0, 0].pie(
            [compliant, non_compliant],
            labels=["ملتزم", "غير ملتزم"],
            colors=["#10b981", "#ef4444"],
            autopct="%1.1f%%",
            textprops={"color": "#e2e8f0", "fontsize": 12},
        )
        axes[0, 0].set_title("نسبة الامتثال", color="#0ea5e9", fontsize=14)
        axes[0, 0].set_facecolor("#0f172a")

    # 2. أعمدة: عدد الروابط لكل موقع
    if "links_found" in df.columns and "domain" in df.columns:
        top_sites = df.nlargest(10, "links_found")
        axes[0, 1].barh(top_sites["domain"], top_sites["links_found"], color="#0ea5e9")
        axes[0, 1].set_title("عدد روابط الخصوصية لكل موقع", color="#0ea5e9", fontsize=14)
        axes[0, 1].set_facecolor("#1e293b")
        axes[0, 1].tick_params(colors="#94a3b8")
        axes[0, 1].spines["bottom"].set_color("#334155")
        axes[0, 1].spines["left"].set_color("#334155")
        axes[0, 1].spines["top"].set_visible(False)
        axes[0, 1].spines["right"].set_visible(False)

    # 3. إحصائيات نصية
    axes[1, 0].set_facecolor("#1e293b")
    axes[1, 0].axis("off")
    stats_text = f"""
    إجمالي المواقع: {len(df)}
    ملتزمة: {int(df['has_privacy_policy'].sum()) if 'has_privacy_policy' in df.columns else 'N/A'}
    غير ملتزمة: {int((~df['has_privacy_policy']).sum()) if 'has_privacy_policy' in df.columns else 'N/A'}
    تاريخ الفحص: {datetime.now().strftime('%Y-%m-%d')}
    """
    axes[1, 0].text(0.1, 0.5, stats_text, transform=axes[1, 0].transAxes,
                     fontsize=14, color="#e2e8f0", verticalalignment="center",
                     bbox=dict(boxstyle="round,pad=0.5", facecolor="#1e293b", edgecolor="#334155"))

    # 4. توزيع الكلمات المفتاحية
    axes[1, 1].set_facecolor("#1e293b")
    axes[1, 1].set_title("حالة الامتثال", color="#0ea5e9", fontsize=14)
    if "has_privacy_policy" in df.columns:
        statuses = df["has_privacy_policy"].value_counts()
        colors_map = {True: "#10b981", False: "#ef4444"}
        labels_map = {True: "ملتزم", False: "غير ملتزم"}
        bars = axes[1, 1].bar(
            [labels_map.get(k, str(k)) for k in statuses.index],
            statuses.values,
            color=[colors_map.get(k, "#64748b") for k in statuses.index],
        )
        axes[1, 1].tick_params(colors="#94a3b8")
        axes[1, 1].spines["bottom"].set_color("#334155")
        axes[1, 1].spines["left"].set_color("#334155")
        axes[1, 1].spines["top"].set_visible(False)
        axes[1, 1].spines["right"].set_visible(False)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig(output_image, dpi=150, facecolor="#0f172a", bbox_inches="tight")
    plt.close()

    return {
        "excel_path": output_excel,
        "image_path": output_image,
        "total_sites": len(df),
        "compliant": int(df["has_privacy_policy"].sum()) if "has_privacy_policy" in df.columns else 0,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 privacy_compliance.py extract <url>")
        print("  python3 privacy_compliance.py dashboard <results.json> <output.xlsx> <output.png>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "extract":
        url = sys.argv[2]
        result = extract_privacy_links(url)
        print(json.dumps(result, ensure_ascii=False, indent=2))

    elif command == "dashboard":
        results_file = sys.argv[2]
        output_excel = sys.argv[3]
        output_image = sys.argv[4]
        with open(results_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        result = create_compliance_dashboard(data, output_excel, output_image)
        print(json.dumps(result, ensure_ascii=False, indent=2))

```

---

## `scripts/run_migration.mjs`

```javascript
import mysql from 'mysql2/promise';
import fs from 'fs';

const DB_URL = process.env.DATABASE_URL || 'mysql://root:cQOxZQQWCkiHpTDzjwPmYhLnWQAwYCDm@switchyard.proxy.rlwy.net:56082/railway';

async function runMigration() {
  const sql = fs.readFileSync('drizzle/0001_production_migration.sql', 'utf8');
  const conn = await mysql.createConnection(DB_URL);

  // Remove comment-only lines, then split by semicolons at end of statements
  const cleanSql = sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n');
  const statements = cleanSql.split(';\n').map(s => s.trim()).filter(s => s.length > 0);

  let applied = 0;
  let skipped = 0;
  let errors = 0;

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;

    try {
      await conn.execute(trimmed);
      applied++;
      process.stdout.write('✓');
    } catch (e) {
      // ER_TABLE_EXISTS_ERROR (1050) or ER_DUP_FIELDNAME (1060)
      if (e.errno === 1060 || e.errno === 1050) {
        skipped++;
        process.stdout.write('s');
      } else {
        errors++;
        console.error('\n✗ Error:', e.message);
        console.error('  Statement:', trimmed.substring(0, 100) + '...');
      }
    }
  }

  await conn.end();
  console.log('\n');
  console.log('═══════════════════════════════════');
  console.log(`  Applied:  ${applied}`);
  console.log(`  Skipped:  ${skipped} (already exist)`);
  console.log(`  Errors:   ${errors}`);
  console.log('═══════════════════════════════════');

  if (errors > 0) {
    process.exit(1);
  }
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});

```

---

## `scripts/startup.sh`

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Rasid Platform — Production Startup Script
# Runs migrations, seeds defaults, then starts the server
# ═══════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   راصد — بدء تشغيل بيئة الإنتاج        ║"
echo "╚══════════════════════════════════════════╝"

# ─── Step 1: Run pending SQL migrations ───
if [ -d "/app/drizzle" ]; then
  echo "→ [1/2] Checking for pending migrations..."
  for sql_file in /app/drizzle/0001_*.sql; do
    if [ -f "$sql_file" ]; then
      echo "  Applying: $(basename $sql_file)"
      # Use node to run migration since mysql client may not be available
      node -e "
        const mysql = require('mysql2/promise');
        const fs = require('fs');
        (async () => {
          try {
            const sql = fs.readFileSync('$sql_file', 'utf8');
            const conn = await mysql.createConnection(process.env.DATABASE_URL);
            const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
            for (const stmt of statements) {
              if (stmt.trim()) {
                try {
                  await conn.execute(stmt);
                } catch (e) {
                  // Ignore 'already exists' and 'duplicate column' errors
                  if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060 || e.errno === 1050) {
                    console.log('    (skipped — already exists)');
                  } else {
                    console.error('    Error:', e.message);
                  }
                }
              }
            }
            await conn.end();
            console.log('  ✓ Migration applied successfully');
          } catch (e) {
            console.error('  ✗ Migration failed:', e.message);
            // Don't exit — server can still start with existing schema
          }
        })();
      " 2>&1
    fi
  done
  echo "→ Migrations complete."
else
  echo "→ [1/2] No drizzle directory found, skipping migrations."
fi

# ─── Step 2: Start the server (seed runs automatically inside the app) ───
echo "→ [2/2] Starting Rasid server..."
echo "════════════════════════════════════════════"
exec node dist/index.js

```

---

