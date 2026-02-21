# Database Schema

## الجداول الأساسية (منطقياً)
- `users`: بيانات المستخدمين والأدوار.
- `activity_logs`: سجل العمليات.
- `admin_*`: جداول الإدارة والصلاحيات.
- `ai_chat_sessions` و`ai_chat_messages`: جلسات ورسائل المساعد الذكي.

## علاقات رئيسية
- المستخدم يمتلك جلسات AI متعددة.
- كل جلسة AI تحتوي رسائل متعددة.
- المستخدم يمكن أن يرتبط بعدة أدوار عبر جدول وسيط.

## مخطط مبسط
```mermaid
classDiagram
    class users {
      id:int
      username:varchar
      role:varchar
    }
    class ai_chat_sessions {
      id:int
      sessionId:varchar
      userId:int
    }
    class ai_chat_messages {
      id:int
      sessionId:varchar
      msgRole:enum
      content:text
    }
    class admin_roles {
      id:varchar
      roleName:varchar
    }
    class admin_user_roles {
      id:varchar
      urUserId:int
      urRoleId:varchar
    }

    users --> ai_chat_sessions
    ai_chat_sessions --> ai_chat_messages
    users --> admin_user_roles
    admin_roles --> admin_user_roles
```
