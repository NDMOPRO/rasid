# Admin Control Panel Implementation Notes

## 4 new tables needed:
1. permission_groups
2. permissions
3. user_group_assignments
4. page_registry
5. ai_personality_config

## 5 tabs in AdminControlPanel.tsx:
1. Users management
2. Groups management (with permissions modal)
3. Pages management
4. Audit log (existing, link here)
5. AI Training center

## Key files to create:
- server/permissions.ts (middleware)
- client/src/hooks/usePermission.ts
- client/src/pages/AdminControlPanel.tsx
- Add route /admin/control in DashboardLayout.tsx

## Default groups: root_admin, director, manager, analyst, viewer
## root_admin NEVER restricted
## isSystem groups cannot be deleted
