# rasid-leaks - drizzle-meta

> Auto-extracted source code documentation

---

## `drizzle/meta/0000_snapshot.json`

```json
{
  "version": "5",
  "dialect": "mysql",
  "id": "a6342f51-86a9-4582-a554-45bac6e576a5",
  "prevId": "00000000-0000-0000-0000-000000000000",
  "tables": {
    "activity_logs": {
      "name": "activity_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "username": {
          "name": "username",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "action": {
          "name": "action",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "details": {
          "name": "details",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ipAddress": {
          "name": "ipAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "userAgent": {
          "name": "userAgent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_audit_logs": {
      "name": "admin_audit_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "aalUserId": {
          "name": "aalUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalUserName": {
          "name": "aalUserName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalAction": {
          "name": "aalAction",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "aalResourceType": {
          "name": "aalResourceType",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "aalResourceId": {
          "name": "aalResourceId",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalResourceName": {
          "name": "aalResourceName",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalOldValue": {
          "name": "aalOldValue",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalNewValue": {
          "name": "aalNewValue",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalReason": {
          "name": "aalReason",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalIpAddress": {
          "name": "aalIpAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalUserAgent": {
          "name": "aalUserAgent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalIsRollbackable": {
          "name": "aalIsRollbackable",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "aalRolledBack": {
          "name": "aalRolledBack",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "aalRolledBackBy": {
          "name": "aalRolledBackBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aalCreatedAt": {
          "name": "aalCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_audit_logs_id": {
          "name": "admin_audit_logs_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_feature_flags": {
      "name": "admin_feature_flags",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ffKey": {
          "name": "ffKey",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ffDisplayName": {
          "name": "ffDisplayName",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ffDisplayNameEn": {
          "name": "ffDisplayNameEn",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffDescription": {
          "name": "ffDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffIsEnabled": {
          "name": "ffIsEnabled",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "ffTargetType": {
          "name": "ffTargetType",
          "type": "enum('all','roles','groups','users','percentage')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'all'"
        },
        "ffTargetIds": {
          "name": "ffTargetIds",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffEnableAt": {
          "name": "ffEnableAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffDisableAt": {
          "name": "ffDisableAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffUpdatedBy": {
          "name": "ffUpdatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ffCreatedAt": {
          "name": "ffCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ffUpdatedAt": {
          "name": "ffUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_feature_flags_id": {
          "name": "admin_feature_flags_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "admin_feature_flags_ffKey_unique": {
          "name": "admin_feature_flags_ffKey_unique",
          "columns": [
            "ffKey"
          ]
        }
      },
      "checkConstraint": {}
    },
    "admin_group_memberships": {
      "name": "admin_group_memberships",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gmGroupId": {
          "name": "gmGroupId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gmUserId": {
          "name": "gmUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gmJoinedAt": {
          "name": "gmJoinedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_group_memberships_id": {
          "name": "admin_group_memberships_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_group_permissions": {
      "name": "admin_group_permissions",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gpGroupId": {
          "name": "gpGroupId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gpPermissionId": {
          "name": "gpPermissionId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "gpEffect": {
          "name": "gpEffect",
          "type": "enum('allow','deny')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'allow'"
        },
        "gpCreatedAt": {
          "name": "gpCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_group_permissions_id": {
          "name": "admin_group_permissions_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_groups": {
      "name": "admin_groups",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "groupName": {
          "name": "groupName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "groupNameEn": {
          "name": "groupNameEn",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "groupDescription": {
          "name": "groupDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "groupDescriptionEn": {
          "name": "groupDescriptionEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "groupStatus": {
          "name": "groupStatus",
          "type": "enum('active','disabled')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "groupCreatedAt": {
          "name": "groupCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "groupUpdatedAt": {
          "name": "groupUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_groups_id": {
          "name": "admin_groups_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_menu_items": {
      "name": "admin_menu_items",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "miMenuId": {
          "name": "miMenuId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "miParentId": {
          "name": "miParentId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miTitle": {
          "name": "miTitle",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "miTitleEn": {
          "name": "miTitleEn",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miIcon": {
          "name": "miIcon",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miLinkType": {
          "name": "miLinkType",
          "type": "enum('internal','external','anchor','none')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'internal'"
        },
        "miLinkTarget": {
          "name": "miLinkTarget",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miOpenNewTab": {
          "name": "miOpenNewTab",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "miVisibilityRules": {
          "name": "miVisibilityRules",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miBadge": {
          "name": "miBadge",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miBadgeColor": {
          "name": "miBadgeColor",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "miSortOrder": {
          "name": "miSortOrder",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "miStatus": {
          "name": "miStatus",
          "type": "enum('active','disabled')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "miCreatedAt": {
          "name": "miCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "miUpdatedAt": {
          "name": "miUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_menu_items_id": {
          "name": "admin_menu_items_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_menus": {
      "name": "admin_menus",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "menuName": {
          "name": "menuName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "menuNameEn": {
          "name": "menuNameEn",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "menuLocation": {
          "name": "menuLocation",
          "type": "enum('sidebar','top_nav','footer','contextual','mobile')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "menuStatus": {
          "name": "menuStatus",
          "type": "enum('active','disabled')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "menuCreatedAt": {
          "name": "menuCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "menuUpdatedAt": {
          "name": "menuUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_menus_id": {
          "name": "admin_menus_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_permissions": {
      "name": "admin_permissions",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "resourceType": {
          "name": "resourceType",
          "type": "enum('page','section','component','content_type','task','feature','api','menu')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "resourceId": {
          "name": "resourceId",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "resourceName": {
          "name": "resourceName",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "resourceNameEn": {
          "name": "resourceNameEn",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "permAction": {
          "name": "permAction",
          "type": "enum('view','create','edit','delete','publish','unpublish','enable','disable','manage','export','approve')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "permDescription": {
          "name": "permDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "permCreatedAt": {
          "name": "permCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_permissions_id": {
          "name": "admin_permissions_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_role_permissions": {
      "name": "admin_role_permissions",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rpRoleId": {
          "name": "rpRoleId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rpPermissionId": {
          "name": "rpPermissionId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rpEffect": {
          "name": "rpEffect",
          "type": "enum('allow','deny')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'allow'"
        },
        "rpConditions": {
          "name": "rpConditions",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rpCreatedAt": {
          "name": "rpCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_role_permissions_id": {
          "name": "admin_role_permissions_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_roles": {
      "name": "admin_roles",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "roleName": {
          "name": "roleName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "roleNameEn": {
          "name": "roleNameEn",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "roleDescription": {
          "name": "roleDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "roleDescriptionEn": {
          "name": "roleDescriptionEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isSystem": {
          "name": "isSystem",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "rolePriority": {
          "name": "rolePriority",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "roleColor": {
          "name": "roleColor",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "roleStatus": {
          "name": "roleStatus",
          "type": "enum('active','disabled')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "roleCreatedAt": {
          "name": "roleCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "roleUpdatedAt": {
          "name": "roleUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_roles_id": {
          "name": "admin_roles_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_theme_settings": {
      "name": "admin_theme_settings",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "tsCategory": {
          "name": "tsCategory",
          "type": "enum('colors','typography','layout','shadows','animations')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "tsKey": {
          "name": "tsKey",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "tsValue": {
          "name": "tsValue",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "tsValueLight": {
          "name": "tsValueLight",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tsValueDark": {
          "name": "tsValueDark",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tsLabel": {
          "name": "tsLabel",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tsLabelEn": {
          "name": "tsLabelEn",
          "type": "varchar(300)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tsUpdatedBy": {
          "name": "tsUpdatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tsUpdatedAt": {
          "name": "tsUpdatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_theme_settings_id": {
          "name": "admin_theme_settings_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_user_overrides": {
      "name": "admin_user_overrides",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouUserId": {
          "name": "ouUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouPermissionId": {
          "name": "ouPermissionId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouEffect": {
          "name": "ouEffect",
          "type": "enum('allow','deny')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouReason": {
          "name": "ouReason",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouExpiresAt": {
          "name": "ouExpiresAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ouCreatedBy": {
          "name": "ouCreatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ouCreatedAt": {
          "name": "ouCreatedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_user_overrides_id": {
          "name": "admin_user_overrides_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "admin_user_roles": {
      "name": "admin_user_roles",
      "columns": {
        "id": {
          "name": "id",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "urUserId": {
          "name": "urUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "urRoleId": {
          "name": "urRoleId",
          "type": "varchar(36)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "urAssignedAt": {
          "name": "urAssignedAt",
          "type": "bigint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "urAssignedBy": {
          "name": "urAssignedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "admin_user_roles_id": {
          "name": "admin_user_roles_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_chat_messages": {
      "name": "ai_chat_messages",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "sessionId": {
          "name": "sessionId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "messageId": {
          "name": "messageId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "msgRole": {
          "name": "msgRole",
          "type": "enum('user','assistant','system')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "content": {
          "name": "content",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sources": {
          "name": "sources",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tokensUsed": {
          "name": "tokensUsed",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "durationMs": {
          "name": "durationMs",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "model": {
          "name": "model",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_chat_sessions": {
      "name": "ai_chat_sessions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "sessionId": {
          "name": "sessionId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userName": {
          "name": "userName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "messageCount": {
          "name": "messageCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "totalTokens": {
          "name": "totalTokens",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "totalDurationMs": {
          "name": "totalDurationMs",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sessionStatus": {
          "name": "sessionStatus",
          "type": "enum('active','archived','exported')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_custom_commands": {
      "name": "ai_custom_commands",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "command": {
          "name": "command",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "handler": {
          "name": "handler",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "parameters": {
          "name": "parameters",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "exampleUsage": {
          "name": "exampleUsage",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isEnabled": {
          "name": "isEnabled",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_feedback": {
      "name": "ai_feedback",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "chatHistoryId": {
          "name": "chatHistoryId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "enum('good','bad')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "enum('accuracy','relevance','completeness','tone','other')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "notes": {
          "name": "notes",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_ratings": {
      "name": "ai_ratings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "messageId": {
          "name": "messageId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sessionId": {
          "name": "sessionId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "feedback": {
          "name": "feedback",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_response_ratings": {
      "name": "ai_response_ratings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "messageId": {
          "name": "messageId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ratingUserId": {
          "name": "ratingUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ratingUserName": {
          "name": "ratingUserName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userMessage": {
          "name": "userMessage",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiResponse": {
          "name": "aiResponse",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "toolsUsed": {
          "name": "toolsUsed",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ratingFeedback": {
          "name": "ratingFeedback",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ratingCreatedAt": {
          "name": "ratingCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "ai_response_ratings_id": {
          "name": "ai_response_ratings_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_scenarios": {
      "name": "ai_scenarios",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "scenarioType": {
          "name": "scenarioType",
          "type": "enum('greeting','farewell','help','error','report','custom_command','persona','escalation','vip_response')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "triggerPattern": {
          "name": "triggerPattern",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "systemPrompt": {
          "name": "systemPrompt",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "responseTemplate": {
          "name": "responseTemplate",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "conditions": {
          "name": "conditions",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "priority": {
          "name": "priority",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "isEnabled": {
          "name": "isEnabled",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_search_log": {
      "name": "ai_search_log",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "query": {
          "name": "query",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "resultsCount": {
          "name": "resultsCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "topScore": {
          "name": "topScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "wasHelpful": {
          "name": "wasHelpful",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_training_logs": {
      "name": "ai_training_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "action": {
          "name": "action",
          "type": "enum('knowledge_added','knowledge_updated','knowledge_deleted','document_uploaded','document_processed','scenario_added','scenario_updated','action_added','action_updated','feedback_received')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "entityType": {
          "name": "entityType",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "entityId": {
          "name": "entityId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "details": {
          "name": "details",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "performedBy": {
          "name": "performedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "ai_user_sessions": {
      "name": "ai_user_sessions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sessionDate": {
          "name": "sessionDate",
          "type": "date",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "visitCount": {
          "name": "visitCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "lastGreetingId": {
          "name": "lastGreetingId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "alert_contacts": {
      "name": "alert_contacts",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "contactName": {
          "name": "contactName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "contactNameAr": {
          "name": "contactNameAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactEmail": {
          "name": "contactEmail",
          "type": "varchar(320)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactPhone": {
          "name": "contactPhone",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactRole": {
          "name": "contactRole",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactRoleAr": {
          "name": "contactRoleAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "alertChannels": {
          "name": "alertChannels",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "alert_contacts_id": {
          "name": "alert_contacts_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "alert_history": {
      "name": "alert_history",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "ruleId": {
          "name": "ruleId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactId": {
          "name": "contactId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "alertContactName": {
          "name": "alertContactName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "deliveryChannel": {
          "name": "deliveryChannel",
          "type": "enum('email','sms')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "alertSubject": {
          "name": "alertSubject",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "alertBody": {
          "name": "alertBody",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "deliveryStatus": {
          "name": "deliveryStatus",
          "type": "enum('sent','failed','pending')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'pending'"
        },
        "alertLeakId": {
          "name": "alertLeakId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sentAt": {
          "name": "sentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "alert_history_id": {
          "name": "alert_history_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "alert_rules": {
      "name": "alert_rules",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "ruleName": {
          "name": "ruleName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleNameAr": {
          "name": "ruleNameAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "severityThreshold": {
          "name": "severityThreshold",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "alertChannel": {
          "name": "alertChannel",
          "type": "enum('email','sms','both')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'email'"
        },
        "isEnabled": {
          "name": "isEnabled",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "ruleRecipients": {
          "name": "ruleRecipients",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "('[]')"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "alert_rules_id": {
          "name": "alert_rules_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "api_keys": {
      "name": "api_keys",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "keyHash": {
          "name": "keyHash",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "keyPrefix": {
          "name": "keyPrefix",
          "type": "varchar(16)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "permissions": {
          "name": "permissions",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "lastUsedAt": {
          "name": "lastUsedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "expiresAt": {
          "name": "expiresAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "requestCount": {
          "name": "requestCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "app_scans": {
      "name": "app_scans",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "appId": {
          "name": "appId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "overallScore": {
          "name": "overallScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "complianceStatus": {
          "name": "complianceStatus",
          "type": "enum('compliant','partially_compliant','non_compliant','no_policy')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'no_policy'"
        },
        "summary": {
          "name": "summary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause1Compliant": {
          "name": "clause1Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause1Evidence": {
          "name": "clause1Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause2Compliant": {
          "name": "clause2Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause2Evidence": {
          "name": "clause2Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause3Compliant": {
          "name": "clause3Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause3Evidence": {
          "name": "clause3Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause4Compliant": {
          "name": "clause4Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause4Evidence": {
          "name": "clause4Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause5Compliant": {
          "name": "clause5Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause5Evidence": {
          "name": "clause5Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause6Compliant": {
          "name": "clause6Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause6Evidence": {
          "name": "clause6Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause7Compliant": {
          "name": "clause7Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause7Evidence": {
          "name": "clause7Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause8Compliant": {
          "name": "clause8Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause8Evidence": {
          "name": "clause8Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextContent": {
          "name": "privacyTextContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "detectedLanguage": {
          "name": "detectedLanguage",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recommendations": {
          "name": "recommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scannedBy": {
          "name": "scannedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scanDate": {
          "name": "scanDate",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "audit_log": {
      "name": "audit_log",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "userName": {
          "name": "userName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "action": {
          "name": "action",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "auditCategory": {
          "name": "auditCategory",
          "type": "enum('auth','leak','export','pii','user','report','system','monitoring','enrichment','alert','retention','api','user_management')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'system'"
        },
        "details": {
          "name": "details",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ipAddress": {
          "name": "ipAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "audit_log_id": {
          "name": "audit_log_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "batch_scan_jobs": {
      "name": "batch_scan_jobs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "jobName": {
          "name": "jobName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "totalUrls": {
          "name": "totalUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "completedUrls": {
          "name": "completedUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "failedUrls": {
          "name": "failedUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "status": {
          "name": "status",
          "type": "enum('pending','running','completed','failed','cancelled')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'pending'"
        },
        "results": {
          "name": "results",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "startedAt": {
          "name": "startedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "completedAt": {
          "name": "completedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "bulk_analysis_jobs": {
      "name": "bulk_analysis_jobs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "jobName": {
          "name": "jobName",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "totalUrls": {
          "name": "totalUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "analyzedUrls": {
          "name": "analyzedUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "failedUrls": {
          "name": "failedUrls",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "compliantCount": {
          "name": "compliantCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "partialCount": {
          "name": "partialCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "nonCompliantCount": {
          "name": "nonCompliantCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "noPolicyCount": {
          "name": "noPolicyCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "avgScore": {
          "name": "avgScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "status": {
          "name": "status",
          "type": "enum('pending','running','paused','completed','failed','cancelled')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'pending'"
        },
        "sourceType": {
          "name": "sourceType",
          "type": "enum('csv_import','manual','crawl_results')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'manual'"
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "startedAt": {
          "name": "startedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "completedAt": {
          "name": "completedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "bulk_analysis_results": {
      "name": "bulk_analysis_results",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "jobId": {
          "name": "jobId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "privacyUrl": {
          "name": "privacyUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "overallScore": {
          "name": "overallScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "complianceStatus": {
          "name": "complianceStatus",
          "type": "enum('compliant','partially_compliant','non_compliant','no_policy','error')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'no_policy'"
        },
        "clause1": {
          "name": "clause1",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause1Evidence": {
          "name": "clause1Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause2": {
          "name": "clause2",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause2Evidence": {
          "name": "clause2Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause3": {
          "name": "clause3",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause3Evidence": {
          "name": "clause3Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause4": {
          "name": "clause4",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause4Evidence": {
          "name": "clause4Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause5": {
          "name": "clause5",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause5Evidence": {
          "name": "clause5Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause6": {
          "name": "clause6",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause6Evidence": {
          "name": "clause6Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause7": {
          "name": "clause7",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause7Evidence": {
          "name": "clause7Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause8": {
          "name": "clause8",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause8Evidence": {
          "name": "clause8Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "summary": {
          "name": "summary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recommendations": {
          "name": "recommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextLength": {
          "name": "privacyTextLength",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "errorMessage": {
          "name": "errorMessage",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "analyzedAt": {
          "name": "analyzedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "case_comments": {
      "name": "case_comments",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "caseId": {
          "name": "caseId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "content": {
          "name": "content",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "parentId": {
          "name": "parentId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isInternal": {
          "name": "isInternal",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "case_history": {
      "name": "case_history",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "caseId": {
          "name": "caseId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fromStage": {
          "name": "fromStage",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "toStage": {
          "name": "toStage",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "action": {
          "name": "action",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "comment": {
          "name": "comment",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "attachments": {
          "name": "attachments",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "performedBy": {
          "name": "performedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "cases": {
      "name": "cases",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "caseNumber": {
          "name": "caseNumber",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "appId": {
          "name": "appId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "requesterId": {
          "name": "requesterId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "assignedTo": {
          "name": "assignedTo",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "stage": {
          "name": "stage",
          "type": "enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'submission'"
        },
        "priority": {
          "name": "priority",
          "type": "enum('low','medium','high','critical')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'medium'"
        },
        "status": {
          "name": "status",
          "type": "enum('open','in_progress','pending_review','escalated','resolved','closed')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'open'"
        },
        "dueDate": {
          "name": "dueDate",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "resolvedAt": {
          "name": "resolvedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "closedAt": {
          "name": "closedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "cases_caseNumber_unique": {
          "name": "cases_caseNumber_unique",
          "columns": [
            "caseNumber"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "change_detection_logs": {
      "name": "change_detection_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "scanId": {
          "name": "scanId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousScanId": {
          "name": "previousScanId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "changeType": {
          "name": "changeType",
          "type": "enum('added','removed','modified','no_change')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'no_change'"
        },
        "previousScore": {
          "name": "previousScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newScore": {
          "name": "newScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scoreDelta": {
          "name": "scoreDelta",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "previousStatus": {
          "name": "previousStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newStatus": {
          "name": "newStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clauseChanges": {
          "name": "clauseChanges",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "textDiffSummary": {
          "name": "textDiffSummary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "policyAdded": {
          "name": "policyAdded",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "policyRemoved": {
          "name": "policyRemoved",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "significantChange": {
          "name": "significantChange",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "detectedAt": {
          "name": "detectedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "channels": {
      "name": "channels",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "channelId": {
          "name": "channelId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "platform": {
          "name": "platform",
          "type": "enum('telegram','darkweb','paste')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "subscribers": {
          "name": "subscribers",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "status": {
          "name": "status",
          "type": "enum('active','paused','flagged')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "lastActivity": {
          "name": "lastActivity",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "leaksDetected": {
          "name": "leaksDetected",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "riskLevel": {
          "name": "riskLevel",
          "type": "enum('high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'medium'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "channels_id": {
          "name": "channels_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "channels_channelId_unique": {
          "name": "channels_channelId_unique",
          "columns": [
            "channelId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "chat_conversations": {
      "name": "chat_conversations",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "ccConversationId": {
          "name": "ccConversationId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ccUserId": {
          "name": "ccUserId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ccUserName": {
          "name": "ccUserName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ccTitle": {
          "name": "ccTitle",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ccSummary": {
          "name": "ccSummary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ccMessageCount": {
          "name": "ccMessageCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "ccTotalToolsUsed": {
          "name": "ccTotalToolsUsed",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "ccStatus": {
          "name": "ccStatus",
          "type": "enum('active','archived','exported')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "ccCreatedAt": {
          "name": "ccCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "ccUpdatedAt": {
          "name": "ccUpdatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "chat_conversations_id": {
          "name": "chat_conversations_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "chat_conversations_ccConversationId_unique": {
          "name": "chat_conversations_ccConversationId_unique",
          "columns": [
            "ccConversationId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "chat_history": {
      "name": "chat_history",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "message": {
          "name": "message",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "response": {
          "name": "response",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "enum('good','bad')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "chat_messages": {
      "name": "chat_messages",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "cmConversationId": {
          "name": "cmConversationId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "cmMessageId": {
          "name": "cmMessageId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "cmRole": {
          "name": "cmRole",
          "type": "enum('user','assistant')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "cmContent": {
          "name": "cmContent",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "cmToolsUsed": {
          "name": "cmToolsUsed",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cmThinkingSteps": {
          "name": "cmThinkingSteps",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cmRating": {
          "name": "cmRating",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cmCreatedAt": {
          "name": "cmCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "chat_messages_id": {
          "name": "chat_messages_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "compliance_alerts": {
      "name": "compliance_alerts",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousStatus": {
          "name": "previousStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newStatus": {
          "name": "newStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousScore": {
          "name": "previousScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newScore": {
          "name": "newScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scanId": {
          "name": "scanId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isRead": {
          "name": "isRead",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "compliance_change_notifications": {
      "name": "compliance_change_notifications",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousStatus": {
          "name": "previousStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newStatus": {
          "name": "newStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousScore": {
          "name": "previousScore",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newScore": {
          "name": "newScore",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "emailSent": {
          "name": "emailSent",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "emailSentTo": {
          "name": "emailSentTo",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "emailSentAt": {
          "name": "emailSentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "content_blocks": {
      "name": "content_blocks",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "blockKey": {
          "name": "blockKey",
          "type": "varchar(150)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "pageKey": {
          "name": "pageKey",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "blockType": {
          "name": "blockType",
          "type": "enum('text','html','image','logo','banner','footer','header','widget')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'text'"
        },
        "titleAr": {
          "name": "titleAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "titleEn": {
          "name": "titleEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contentAr": {
          "name": "contentAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contentEn": {
          "name": "contentEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "imageUrl": {
          "name": "imageUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "linkUrl": {
          "name": "linkUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sortOrder": {
          "name": "sortOrder",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "isVisible": {
          "name": "isVisible",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "customCss": {
          "name": "customCss",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "content_blocks_blockKey_unique": {
          "name": "content_blocks_blockKey_unique",
          "columns": [
            "blockKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "custom_actions": {
      "name": "custom_actions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "triggerPhrase": {
          "name": "triggerPhrase",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "aliases": {
          "name": "aliases",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "actionType": {
          "name": "actionType",
          "type": "enum('call_function','custom_code','redirect','api_call')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "actionTarget": {
          "name": "actionTarget",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "dark_web_listings": {
      "name": "dark_web_listings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "listingSeverity": {
          "name": "listingSeverity",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sourceChannelId": {
          "name": "sourceChannelId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sourceName": {
          "name": "sourceName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "price": {
          "name": "price",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recordCount": {
          "name": "recordCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "detectedAt": {
          "name": "detectedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "dark_web_listings_id": {
          "name": "dark_web_listings_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "dashboard_snapshots": {
      "name": "dashboard_snapshots",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "snapshotDate": {
          "name": "snapshotDate",
          "type": "date",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "totalWebsites": {
          "name": "totalWebsites",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "compliantCount": {
          "name": "compliantCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "partialCount": {
          "name": "partialCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "nonCompliantCount": {
          "name": "nonCompliantCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "noPolicyCount": {
          "name": "noPolicyCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "averageScore": {
          "name": "averageScore",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion1Rate": {
          "name": "criterion1Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion2Rate": {
          "name": "criterion2Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion3Rate": {
          "name": "criterion3Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion4Rate": {
          "name": "criterion4Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion5Rate": {
          "name": "criterion5Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion6Rate": {
          "name": "criterion6Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion7Rate": {
          "name": "criterion7Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "criterion8Rate": {
          "name": "criterion8Rate",
          "type": "decimal(5,2)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'0'"
        },
        "sectorBreakdown": {
          "name": "sectorBreakdown",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "domainTypeBreakdown": {
          "name": "domainTypeBreakdown",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "data_transfer_logs": {
      "name": "data_transfer_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "transferType": {
          "name": "transferType",
          "type": "enum('export','import')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "dataSection": {
          "name": "dataSection",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fileName": {
          "name": "fileName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "fileUrl": {
          "name": "fileUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recordCount": {
          "name": "recordCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "status": {
          "name": "status",
          "type": "enum('pending','processing','completed','failed')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'pending'"
        },
        "errorMessage": {
          "name": "errorMessage",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "completedAt": {
          "name": "completedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "deep_scan_queue": {
      "name": "deep_scan_queue",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "jobId": {
          "name": "jobId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "url": {
          "name": "url",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "status": {
          "name": "status",
          "type": "enum('pending','scanning','completed','failed','skipped')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'pending'"
        },
        "siteReachable": {
          "name": "siteReachable",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "siteName": {
          "name": "siteName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteTitle": {
          "name": "siteTitle",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "httpStatus": {
          "name": "httpStatus",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "redirectUrl": {
          "name": "redirectUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyUrl": {
          "name": "privacyUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyMethod": {
          "name": "privacyMethod",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextContent": {
          "name": "privacyTextContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextLength": {
          "name": "privacyTextLength",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "privacyLanguage": {
          "name": "privacyLanguage",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "screenshotUrl": {
          "name": "screenshotUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyScreenshotUrl": {
          "name": "privacyScreenshotUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactUrl": {
          "name": "contactUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactEmails": {
          "name": "contactEmails",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactPhones": {
          "name": "contactPhones",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "socialLinks": {
          "name": "socialLinks",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "overallScore": {
          "name": "overallScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "complianceStatus": {
          "name": "complianceStatus",
          "type": "enum('compliant','partially_compliant','non_compliant','no_policy','error')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'no_policy'"
        },
        "clause1Compliant": {
          "name": "clause1Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause1Evidence": {
          "name": "clause1Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause2Compliant": {
          "name": "clause2Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause2Evidence": {
          "name": "clause2Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause3Compliant": {
          "name": "clause3Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause3Evidence": {
          "name": "clause3Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause4Compliant": {
          "name": "clause4Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause4Evidence": {
          "name": "clause4Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause5Compliant": {
          "name": "clause5Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause5Evidence": {
          "name": "clause5Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause6Compliant": {
          "name": "clause6Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause6Evidence": {
          "name": "clause6Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause7Compliant": {
          "name": "clause7Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause7Evidence": {
          "name": "clause7Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause8Compliant": {
          "name": "clause8Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause8Evidence": {
          "name": "clause8Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "summary": {
          "name": "summary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recommendations": {
          "name": "recommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "errorMessage": {
          "name": "errorMessage",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "retryCount": {
          "name": "retryCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "scanDuration": {
          "name": "scanDuration",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "scannedAt": {
          "name": "scannedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "documents": {
      "name": "documents",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "documentId": {
          "name": "documentId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "recordId": {
          "name": "recordId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "verificationCode": {
          "name": "verificationCode",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "contentHash": {
          "name": "contentHash",
          "type": "varchar(128)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "documentType": {
          "name": "documentType",
          "type": "enum('incident_report','custom_report','executive_summary','compliance_report','sector_report')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'incident_report'"
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "generatedBy": {
          "name": "generatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "generatedByName": {
          "name": "generatedByName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "pdfUrl": {
          "name": "pdfUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "htmlContent": {
          "name": "htmlContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isVerified": {
          "name": "isVerified",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {
        "documents_documentId_unique": {
          "name": "documents_documentId_unique",
          "columns": [
            "documentId"
          ],
          "isUnique": false
        },
        "documents_verificationCode_unique": {
          "name": "documents_verificationCode_unique",
          "columns": [
            "verificationCode"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "email_notification_prefs": {
      "name": "email_notification_prefs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "emailAddress": {
          "name": "emailAddress",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "notifyOnStatusChange": {
          "name": "notifyOnStatusChange",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "notifyOnScoreChange": {
          "name": "notifyOnScoreChange",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "notifyOnNewScan": {
          "name": "notifyOnNewScan",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "notifyOnCriticalOnly": {
          "name": "notifyOnCriticalOnly",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "minScoreChangeThreshold": {
          "name": "minScoreChangeThreshold",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 10
        },
        "sectorFilter": {
          "name": "sectorFilter",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "lastNotifiedAt": {
          "name": "lastNotifiedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "escalation_logs": {
      "name": "escalation_logs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "caseId": {
          "name": "caseId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleId": {
          "name": "ruleId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousStage": {
          "name": "previousStage",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "newStage": {
          "name": "newStage",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousPriority": {
          "name": "previousPriority",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newPriority": {
          "name": "newPriority",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "hoursOverdue": {
          "name": "hoursOverdue",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "notified": {
          "name": "notified",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "escalatedAt": {
          "name": "escalatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "escalation_rules": {
      "name": "escalation_rules",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "fromStage": {
          "name": "fromStage",
          "type": "enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "toStage": {
          "name": "toStage",
          "type": "enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "maxHours": {
          "name": "maxHours",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 48
        },
        "escalatePriority": {
          "name": "escalatePriority",
          "type": "enum('low','medium','high','critical')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "appliesTo": {
          "name": "appliesTo",
          "type": "enum('low','medium','high','critical')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "notifyRoles": {
          "name": "notifyRoles",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "evidence_chain": {
      "name": "evidence_chain",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "evidenceId": {
          "name": "evidenceId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "evidenceLeakId": {
          "name": "evidenceLeakId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "evidenceType": {
          "name": "evidenceType",
          "type": "enum('text','screenshot','file','metadata')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "contentHash": {
          "name": "contentHash",
          "type": "varchar(128)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "previousHash": {
          "name": "previousHash",
          "type": "varchar(128)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "blockIndex": {
          "name": "blockIndex",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "capturedBy": {
          "name": "capturedBy",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "evidenceMetadata": {
          "name": "evidenceMetadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isVerified": {
          "name": "isVerified",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "capturedAt": {
          "name": "capturedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "evidenceCreatedAt": {
          "name": "evidenceCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "evidence_chain_id": {
          "name": "evidence_chain_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "evidence_chain_evidenceId_unique": {
          "name": "evidence_chain_evidenceId_unique",
          "columns": [
            "evidenceId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "executive_alerts": {
      "name": "executive_alerts",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "severity": {
          "name": "severity",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'medium'"
        },
        "alertType": {
          "name": "alertType",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "entityId": {
          "name": "entityId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "entityName": {
          "name": "entityName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "suggestedAction": {
          "name": "suggestedAction",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isAcknowledged": {
          "name": "isAcknowledged",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "acknowledgedBy": {
          "name": "acknowledgedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "acknowledgedAt": {
          "name": "acknowledgedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "executive_reports": {
      "name": "executive_reports",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "reportType": {
          "name": "reportType",
          "type": "enum('daily','weekly','monthly')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'weekly'"
        },
        "reportDate": {
          "name": "reportDate",
          "type": "date",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "contentJson": {
          "name": "contentJson",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "pdfUrl": {
          "name": "pdfUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isSent": {
          "name": "isSent",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sentAt": {
          "name": "sentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recipients": {
          "name": "recipients",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "feedback_entries": {
      "name": "feedback_entries",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "feedbackLeakId": {
          "name": "feedbackLeakId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "feedbackUserId": {
          "name": "feedbackUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "feedbackUserName": {
          "name": "feedbackUserName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "systemClassification": {
          "name": "systemClassification",
          "type": "enum('personal_data','cybersecurity','clean','unknown')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "analystClassification": {
          "name": "analystClassification",
          "type": "enum('personal_data','cybersecurity','clean','unknown')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "isCorrect": {
          "name": "isCorrect",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "feedbackNotes": {
          "name": "feedbackNotes",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "feedbackCreatedAt": {
          "name": "feedbackCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "feedback_entries_id": {
          "name": "feedback_entries_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "incident_certifications": {
      "name": "incident_certifications",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "certCode": {
          "name": "certCode",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "incidentId": {
          "name": "incidentId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "incidentTitle": {
          "name": "incidentTitle",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "incidentTitleAr": {
          "name": "incidentTitleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certSeverity": {
          "name": "certSeverity",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certSector": {
          "name": "certSector",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certRecordsExposed": {
          "name": "certRecordsExposed",
          "type": "bigint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "issuedBy": {
          "name": "issuedBy",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "issuedByUserId": {
          "name": "issuedByUserId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "issuedAt": {
          "name": "issuedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "certPdfUrl": {
          "name": "certPdfUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certHtmlContent": {
          "name": "certHtmlContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certSha256Hash": {
          "name": "certSha256Hash",
          "type": "varchar(128)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "certStatus": {
          "name": "certStatus",
          "type": "enum('active','revoked')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "revokedAt": {
          "name": "revokedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "revokedBy": {
          "name": "revokedBy",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "verifiedCount": {
          "name": "verifiedCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "lastVerifiedAt": {
          "name": "lastVerifiedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "incident_certifications_id": {
          "name": "incident_certifications_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "incident_certifications_certCode_unique": {
          "name": "incident_certifications_certCode_unique",
          "columns": [
            "certCode"
          ]
        }
      },
      "checkConstraint": {}
    },
    "incident_documents": {
      "name": "incident_documents",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "documentId": {
          "name": "documentId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "leakId": {
          "name": "leakId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "verificationCode": {
          "name": "verificationCode",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "contentHash": {
          "name": "contentHash",
          "type": "varchar(128)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "documentType": {
          "name": "documentType",
          "type": "enum('incident_report','custom_report','executive_summary')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'incident_report'"
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "generatedBy": {
          "name": "generatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "generatedByName": {
          "name": "generatedByName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "pdfUrl": {
          "name": "pdfUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "docMetadata": {
          "name": "docMetadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isVerified": {
          "name": "isVerified",
          "type": "boolean",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": true
        },
        "docCreatedAt": {
          "name": "docCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "incident_documents_id": {
          "name": "incident_documents_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "incident_documents_documentId_unique": {
          "name": "incident_documents_documentId_unique",
          "columns": [
            "documentId"
          ]
        },
        "incident_documents_verificationCode_unique": {
          "name": "incident_documents_verificationCode_unique",
          "columns": [
            "verificationCode"
          ]
        }
      },
      "checkConstraint": {}
    },
    "kb_search_log": {
      "name": "kb_search_log",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "kbsQuery": {
          "name": "kbsQuery",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "kbsResultsCount": {
          "name": "kbsResultsCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "kbsMatchedIds": {
          "name": "kbsMatchedIds",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "kbsUserId": {
          "name": "kbsUserId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "kbsSource": {
          "name": "kbsSource",
          "type": "enum('manual','ai_auto','api')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'manual'"
        },
        "kbsCreatedAt": {
          "name": "kbsCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "kb_search_log_id": {
          "name": "kb_search_log_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "knowledge_base": {
      "name": "knowledge_base",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "type": {
          "name": "type",
          "type": "enum('document','qa','feedback','article','faq','regulation','term','guide','document_chunk')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "question": {
          "name": "question",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "answer": {
          "name": "answer",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "content": {
          "name": "content",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "source": {
          "name": "source",
          "type": "varchar(1000)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tags": {
          "name": "tags",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "embedding": {
          "name": "embedding",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "embeddingModel": {
          "name": "embeddingModel",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "tokenCount": {
          "name": "tokenCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "viewCount": {
          "name": "viewCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "useCount": {
          "name": "useCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "knowledge_graph_edges": {
      "name": "knowledge_graph_edges",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "sourceNodeId": {
          "name": "sourceNodeId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "targetNodeId": {
          "name": "targetNodeId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "edgeRelationship": {
          "name": "edgeRelationship",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "edgeRelationshipAr": {
          "name": "edgeRelationshipAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "edgeWeight": {
          "name": "edgeWeight",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "edgeMetadata": {
          "name": "edgeMetadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "edgeCreatedAt": {
          "name": "edgeCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "knowledge_graph_edges_id": {
          "name": "knowledge_graph_edges_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "knowledge_graph_nodes": {
      "name": "knowledge_graph_nodes",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "nodeId": {
          "name": "nodeId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nodeType": {
          "name": "nodeType",
          "type": "enum('leak','seller','entity','sector','pii_type','platform','campaign')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nodeLabel": {
          "name": "nodeLabel",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nodeLabelAr": {
          "name": "nodeLabelAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "nodeMetadata": {
          "name": "nodeMetadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "nodeCreatedAt": {
          "name": "nodeCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "knowledge_graph_nodes_id": {
          "name": "knowledge_graph_nodes_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "knowledge_graph_nodes_nodeId_unique": {
          "name": "knowledge_graph_nodes_nodeId_unique",
          "columns": [
            "nodeId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "kpi_targets": {
      "name": "kpi_targets",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nameAr": {
          "name": "nameAr",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "enum('compliance','scanning','response','coverage','quality')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'compliance'"
        },
        "targetValue": {
          "name": "targetValue",
          "type": "float",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "currentValue": {
          "name": "currentValue",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "unit": {
          "name": "unit",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'%'"
        },
        "period": {
          "name": "period",
          "type": "enum('monthly','quarterly','yearly')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'monthly'"
        },
        "direction": {
          "name": "direction",
          "type": "enum('higher_is_better','lower_is_better')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'higher_is_better'"
        },
        "thresholdGreen": {
          "name": "thresholdGreen",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 80
        },
        "thresholdYellow": {
          "name": "thresholdYellow",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 60
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "leaks": {
      "name": "leaks",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "leakId": {
          "name": "leakId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "source": {
          "name": "source",
          "type": "enum('telegram','darkweb','paste')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "severity": {
          "name": "severity",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sector": {
          "name": "sector",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sectorAr": {
          "name": "sectorAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "piiTypes": {
          "name": "piiTypes",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "recordCount": {
          "name": "recordCount",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "status": {
          "name": "status",
          "type": "enum('new','analyzing','documented','reported')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'new'"
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "descriptionAr": {
          "name": "descriptionAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiSeverity": {
          "name": "aiSeverity",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiSummary": {
          "name": "aiSummary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiSummaryAr": {
          "name": "aiSummaryAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiRecommendations": {
          "name": "aiRecommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiRecommendationsAr": {
          "name": "aiRecommendationsAr",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "aiConfidence": {
          "name": "aiConfidence",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "enrichedAt": {
          "name": "enrichedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sampleData": {
          "name": "sampleData",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sourceUrl": {
          "name": "sourceUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sourcePlatform": {
          "name": "sourcePlatform",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "screenshotUrls": {
          "name": "screenshotUrls",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "threatActor": {
          "name": "threatActor",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "leakPrice": {
          "name": "leakPrice",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "breachMethod": {
          "name": "breachMethod",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "breachMethodAr": {
          "name": "breachMethodAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "region": {
          "name": "region",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "regionAr": {
          "name": "regionAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "city": {
          "name": "city",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cityAr": {
          "name": "cityAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "latitude": {
          "name": "latitude",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "longitude": {
          "name": "longitude",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "detectedAt": {
          "name": "detectedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "leaks_id": {
          "name": "leaks_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "leaks_leakId_unique": {
          "name": "leaks_leakId_unique",
          "columns": [
            "leakId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "letters": {
      "name": "letters",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "scanId": {
          "name": "scanId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recipientEmail": {
          "name": "recipientEmail",
          "type": "varchar(320)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "subject": {
          "name": "subject",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "body": {
          "name": "body",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "status": {
          "name": "status",
          "type": "enum('draft','sent','delivered','read','responded','escalated')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'draft'"
        },
        "escalationLevel": {
          "name": "escalationLevel",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sentAt": {
          "name": "sentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "respondedAt": {
          "name": "respondedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        },
        "templateId": {
          "name": "templateId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "deadline": {
          "name": "deadline",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "reminderSentAt": {
          "name": "reminderSentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "notes": {
          "name": "notes",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "message_templates": {
      "name": "message_templates",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "templateKey": {
          "name": "templateKey",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nameAr": {
          "name": "nameAr",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nameEn": {
          "name": "nameEn",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "subject": {
          "name": "subject",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "body": {
          "name": "body",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "variables": {
          "name": "variables",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "message_templates_templateKey_unique": {
          "name": "message_templates_templateKey_unique",
          "columns": [
            "templateKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "mobile_apps": {
      "name": "mobile_apps",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "appName": {
          "name": "appName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "appNameAr": {
          "name": "appNameAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "developer": {
          "name": "developer",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "platform": {
          "name": "platform",
          "type": "enum('android','ios','huawei')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "storeUrl": {
          "name": "storeUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "packageName": {
          "name": "packageName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyPolicyUrl": {
          "name": "privacyPolicyUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "iconUrl": {
          "name": "iconUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "downloads": {
          "name": "downloads",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sectorType": {
          "name": "sectorType",
          "type": "enum('public','private')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'private'"
        },
        "entityName": {
          "name": "entityName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "monitoring_jobs": {
      "name": "monitoring_jobs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "jobId": {
          "name": "jobId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "jobName": {
          "name": "jobName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "jobNameAr": {
          "name": "jobNameAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "jobPlatform": {
          "name": "jobPlatform",
          "type": "enum('telegram','darkweb','paste','all')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "cronExpression": {
          "name": "cronExpression",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "jobStatus": {
          "name": "jobStatus",
          "type": "enum('active','paused','running','error')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "lastRunAt": {
          "name": "lastRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "nextRunAt": {
          "name": "nextRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "lastResult": {
          "name": "lastResult",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "leaksFound": {
          "name": "leaksFound",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "totalRuns": {
          "name": "totalRuns",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "monitoring_jobs_id": {
          "name": "monitoring_jobs_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "monitoring_jobs_jobId_unique": {
          "name": "monitoring_jobs_jobId_unique",
          "columns": [
            "jobId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "notifications": {
      "name": "notifications",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "message": {
          "name": "message",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "type": {
          "name": "type",
          "type": "enum('info','warning','success','error')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'info'"
        },
        "isRead": {
          "name": "isRead",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "link": {
          "name": "link",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "osint_queries": {
      "name": "osint_queries",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "queryId": {
          "name": "queryId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryName": {
          "name": "queryName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryNameAr": {
          "name": "queryNameAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryType": {
          "name": "queryType",
          "type": "enum('google_dork','shodan','recon','spiderfoot')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryCategory": {
          "name": "queryCategory",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryCategoryAr": {
          "name": "queryCategoryAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "queryText": {
          "name": "queryText",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "queryDescription": {
          "name": "queryDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "queryDescriptionAr": {
          "name": "queryDescriptionAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "queryResultsCount": {
          "name": "queryResultsCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "queryLastRunAt": {
          "name": "queryLastRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "queryEnabled": {
          "name": "queryEnabled",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "queryCreatedAt": {
          "name": "queryCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "osint_queries_id": {
          "name": "osint_queries_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "osint_queries_queryId_unique": {
          "name": "osint_queries_queryId_unique",
          "columns": [
            "queryId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "page_configs": {
      "name": "page_configs",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "pageKey": {
          "name": "pageKey",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleEn": {
          "name": "titleEn",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "icon": {
          "name": "icon",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "path": {
          "name": "path",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "parentGroup": {
          "name": "parentGroup",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sortOrder": {
          "name": "sortOrder",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "isVisible": {
          "name": "isVisible",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "isEnabled": {
          "name": "isEnabled",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "requiredRole": {
          "name": "requiredRole",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "customCss": {
          "name": "customCss",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "customTitle": {
          "name": "customTitle",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "customDescription": {
          "name": "customDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "badgeText": {
          "name": "badgeText",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "badgeColor": {
          "name": "badgeColor",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "page_configs_pageKey_unique": {
          "name": "page_configs_pageKey_unique",
          "columns": [
            "pageKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "password_reset_tokens": {
      "name": "password_reset_tokens",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "token": {
          "name": "token",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "expiresAt": {
          "name": "expiresAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "used": {
          "name": "used",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {
        "password_reset_tokens_token_unique": {
          "name": "password_reset_tokens_token_unique",
          "columns": [
            "token"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "paste_entries": {
      "name": "paste_entries",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "filename": {
          "name": "filename",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sourceName": {
          "name": "sourceName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fileSize": {
          "name": "fileSize",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "pastePiiTypes": {
          "name": "pastePiiTypes",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "preview": {
          "name": "preview",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "pasteStatus": {
          "name": "pasteStatus",
          "type": "enum('flagged','analyzing','documented','reported')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'flagged'"
        },
        "detectedAt": {
          "name": "detectedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "paste_entries_id": {
          "name": "paste_entries_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "pdf_report_history": {
      "name": "pdf_report_history",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "reportType": {
          "name": "reportType",
          "type": "enum('compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'compliance_summary'"
        },
        "title": {
          "name": "title",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "pdfUrl": {
          "name": "pdfUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "fileSize": {
          "name": "fileSize",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "generatedBy": {
          "name": "generatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scheduledReportId": {
          "name": "scheduledReportId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recipientsSent": {
          "name": "recipientsSent",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isAutoGenerated": {
          "name": "isAutoGenerated",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "personality_scenarios": {
      "name": "personality_scenarios",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "type": {
          "name": "type",
          "type": "enum('welcome_first','welcome_return','leader_respect','farewell','encouragement','occasion')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "triggerKeyword": {
          "name": "triggerKeyword",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "textAr": {
          "name": "textAr",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "pii_scans": {
      "name": "pii_scans",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "inputText": {
          "name": "inputText",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "results": {
          "name": "results",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "totalMatches": {
          "name": "totalMatches",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "pii_scans_id": {
          "name": "pii_scans_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "platform_analytics": {
      "name": "platform_analytics",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "eventType": {
          "name": "eventType",
          "type": "enum('page_view','scan','report','login','export','search','api_call')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "page": {
          "name": "page",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sessionId": {
          "name": "sessionId",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ipAddress": {
          "name": "ipAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "userAgent": {
          "name": "userAgent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "platform_settings": {
      "name": "platform_settings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "settingKey": {
          "name": "settingKey",
          "type": "varchar(150)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "settingValue": {
          "name": "settingValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "settingType": {
          "name": "settingType",
          "type": "enum('string','number','boolean','json','image','color')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'string'"
        },
        "category": {
          "name": "category",
          "type": "enum('branding','theme','typography','layout','pages','content','login_page','sidebar','header','stats_cards','tables','forms','dialogs','reports','letters','scans','ai_assistant','error_pages','email_templates','export','in_app_notifications','executive_dashboard','advanced','members','data_transfer','seo','dashboard','notifications','security')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'branding'"
        },
        "label": {
          "name": "label",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "labelEn": {
          "name": "labelEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isEditable": {
          "name": "isEditable",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "sortOrder": {
          "name": "sortOrder",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "platform_settings_settingKey_unique": {
          "name": "platform_settings_settingKey_unique",
          "columns": [
            "settingKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "platform_users": {
      "name": "platform_users",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "passwordHash": {
          "name": "passwordHash",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "email": {
          "name": "email",
          "type": "varchar(320)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mobile": {
          "name": "mobile",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "displayName": {
          "name": "displayName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "platformRole": {
          "name": "platformRole",
          "type": "enum('root_admin','director','vice_president','manager','analyst','viewer')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'viewer'"
        },
        "status": {
          "name": "status",
          "type": "enum('active','inactive','suspended')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'active'"
        },
        "lastLoginAt": {
          "name": "lastLoginAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "platform_users_id": {
          "name": "platform_users_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "platform_users_userId_unique": {
          "name": "platform_users_userId_unique",
          "columns": [
            "userId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "presentation_templates": {
      "name": "presentation_templates",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "nameEn": {
          "name": "nameEn",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "category": {
          "name": "category",
          "type": "enum('business_plan','report','sales_pitch','compliance','executive','custom')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'custom'"
        },
        "thumbnail": {
          "name": "thumbnail",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "slides": {
          "name": "slides",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "isBuiltIn": {
          "name": "isBuiltIn",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "presentation_templates_id": {
          "name": "presentation_templates_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "presentations": {
      "name": "presentations",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "title": {
          "name": "title",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "templateId": {
          "name": "templateId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "slides": {
          "name": "slides",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "isPublic": {
          "name": "isPublic",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "presentations_id": {
          "name": "presentations_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "report_audit": {
      "name": "report_audit",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "reportId": {
          "name": "reportId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "documentId": {
          "name": "documentId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "reportType": {
          "name": "reportType",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "generatedBy": {
          "name": "generatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "generatedByName": {
          "name": "generatedByName",
          "type": "varchar(200)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "complianceAcknowledged": {
          "name": "complianceAcknowledged",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "acknowledgedAt": {
          "name": "acknowledgedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "filters": {
          "name": "filters",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "report_executions": {
      "name": "report_executions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "reportId": {
          "name": "reportId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "status": {
          "name": "status",
          "type": "enum('running','completed','failed')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'running'"
        },
        "recipientCount": {
          "name": "recipientCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "summary": {
          "name": "summary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "startedAt": {
          "name": "startedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "completedAt": {
          "name": "completedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "reports": {
      "name": "reports",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "title": {
          "name": "title",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "titleAr": {
          "name": "titleAr",
          "type": "varchar(500)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "type": {
          "name": "type",
          "type": "enum('monthly','quarterly','special')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "reportStatus": {
          "name": "reportStatus",
          "type": "enum('draft','published')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'draft'"
        },
        "pageCount": {
          "name": "pageCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "generatedBy": {
          "name": "generatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "fileUrl": {
          "name": "fileUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "reports_id": {
          "name": "reports_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "retention_policies": {
      "name": "retention_policies",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "retentionEntity": {
          "name": "retentionEntity",
          "type": "enum('leaks','audit_logs','notifications','pii_scans','paste_entries')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "entityLabel": {
          "name": "entityLabel",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "entityLabelAr": {
          "name": "entityLabelAr",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "retentionDays": {
          "name": "retentionDays",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 365
        },
        "archiveAction": {
          "name": "archiveAction",
          "type": "enum('delete','archive')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'archive'"
        },
        "isEnabled": {
          "name": "isEnabled",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "lastRunAt": {
          "name": "lastRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recordsArchived": {
          "name": "recordsArchived",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "retention_policies_id": {
          "name": "retention_policies_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "retention_policies_retentionEntity_unique": {
          "name": "retention_policies_retentionEntity_unique",
          "columns": [
            "retentionEntity"
          ]
        }
      },
      "checkConstraint": {}
    },
    "saved_filters": {
      "name": "saved_filters",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "filters": {
          "name": "filters",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "isDefault": {
          "name": "isDefault",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "isShared": {
          "name": "isShared",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "usageCount": {
          "name": "usageCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "scan_schedules": {
      "name": "scan_schedules",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "frequency": {
          "name": "frequency",
          "type": "enum('daily','weekly','monthly')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "dayOfWeek": {
          "name": "dayOfWeek",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "dayOfMonth": {
          "name": "dayOfMonth",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "hour": {
          "name": "hour",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 2
        },
        "targetType": {
          "name": "targetType",
          "type": "enum('all_sites','sector','category','specific_sites','all_apps')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'all_sites'"
        },
        "targetFilter": {
          "name": "targetFilter",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "lastRunAt": {
          "name": "lastRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "nextRunAt": {
          "name": "nextRunAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "scans": {
      "name": "scans",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "overallScore": {
          "name": "overallScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rating": {
          "name": "rating",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "complianceStatus": {
          "name": "complianceStatus",
          "type": "enum('compliant','partially_compliant','non_compliant','no_policy')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'no_policy'"
        },
        "summary": {
          "name": "summary",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause1Compliant": {
          "name": "clause1Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause1Evidence": {
          "name": "clause1Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause2Compliant": {
          "name": "clause2Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause2Evidence": {
          "name": "clause2Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause3Compliant": {
          "name": "clause3Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause3Evidence": {
          "name": "clause3Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause4Compliant": {
          "name": "clause4Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause4Evidence": {
          "name": "clause4Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause5Compliant": {
          "name": "clause5Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause5Evidence": {
          "name": "clause5Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause6Compliant": {
          "name": "clause6Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause6Evidence": {
          "name": "clause6Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause7Compliant": {
          "name": "clause7Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause7Evidence": {
          "name": "clause7Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "clause8Compliant": {
          "name": "clause8Compliant",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "clause8Evidence": {
          "name": "clause8Evidence",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recommendations": {
          "name": "recommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "screenshotUrl": {
          "name": "screenshotUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextContent": {
          "name": "privacyTextContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scannedBy": {
          "name": "scannedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "scanDate": {
          "name": "scanDate",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "detectedLanguage": {
          "name": "detectedLanguage",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTitle": {
          "name": "privacyTitle",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyStatusCode": {
          "name": "privacyStatusCode",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyLanguage": {
          "name": "privacyLanguage",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyLastUpdate": {
          "name": "privacyLastUpdate",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyEntityName": {
          "name": "privacyEntityName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyEmails": {
          "name": "privacyEmails",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyPhones": {
          "name": "privacyPhones",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyAddress": {
          "name": "privacyAddress",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyDpo": {
          "name": "privacyDpo",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyContactForm": {
          "name": "privacyContactForm",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyInternalLinks": {
          "name": "privacyInternalLinks",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyWordCount": {
          "name": "privacyWordCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyCharCount": {
          "name": "privacyCharCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyRobotsStatus": {
          "name": "privacyRobotsStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyDiscoveryMethod": {
          "name": "privacyDiscoveryMethod",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyConfidence": {
          "name": "privacyConfidence",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsDataTypes": {
          "name": "mentionsDataTypes",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "dataTypesList": {
          "name": "dataTypesList",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsPurpose": {
          "name": "mentionsPurpose",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "purposeList": {
          "name": "purposeList",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsLegalBasis": {
          "name": "mentionsLegalBasis",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsRights": {
          "name": "mentionsRights",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "rightsList": {
          "name": "rightsList",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsRetention": {
          "name": "mentionsRetention",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsThirdParties": {
          "name": "mentionsThirdParties",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "thirdPartiesList": {
          "name": "thirdPartiesList",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsCrossBorder": {
          "name": "mentionsCrossBorder",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsSecurity": {
          "name": "mentionsSecurity",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsCookies": {
          "name": "mentionsCookies",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mentionsChildren": {
          "name": "mentionsChildren",
          "type": "varchar(10)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyFinalUrl": {
          "name": "privacyFinalUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "crawlStatus": {
          "name": "crawlStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "schedule_executions": {
      "name": "schedule_executions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "scheduleId": {
          "name": "scheduleId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "startedAt": {
          "name": "startedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "completedAt": {
          "name": "completedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "totalSites": {
          "name": "totalSites",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "completedSites": {
          "name": "completedSites",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "failedSites": {
          "name": "failedSites",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "status": {
          "name": "status",
          "type": "enum('running','completed','failed')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'running'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "scheduled_reports": {
      "name": "scheduled_reports",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "reportType": {
          "name": "reportType",
          "type": "enum('compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'compliance_summary'"
        },
        "frequency": {
          "name": "frequency",
          "type": "enum('daily','weekly','monthly')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "dayOfWeek": {
          "name": "dayOfWeek",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "dayOfMonth": {
          "name": "dayOfMonth",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "hour": {
          "name": "hour",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 8
        },
        "recipients": {
          "name": "recipients",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "filters": {
          "name": "filters",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "includeCharts": {
          "name": "includeCharts",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "lastSentAt": {
          "name": "lastSentAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "nextSendAt": {
          "name": "nextSendAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdBy": {
          "name": "createdBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "seller_profiles": {
      "name": "seller_profiles",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "sellerId": {
          "name": "sellerId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sellerName": {
          "name": "sellerName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sellerAliases": {
          "name": "sellerAliases",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sellerPlatforms": {
          "name": "sellerPlatforms",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "totalLeaks": {
          "name": "totalLeaks",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sellerTotalRecords": {
          "name": "sellerTotalRecords",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sellerRiskScore": {
          "name": "sellerRiskScore",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "sellerRiskLevel": {
          "name": "sellerRiskLevel",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'medium'"
        },
        "sellerSectors": {
          "name": "sellerSectors",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sellerLastActivity": {
          "name": "sellerLastActivity",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sellerFirstSeen": {
          "name": "sellerFirstSeen",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "sellerNotes": {
          "name": "sellerNotes",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sellerIsActive": {
          "name": "sellerIsActive",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "sellerCreatedAt": {
          "name": "sellerCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        },
        "sellerUpdatedAt": {
          "name": "sellerUpdatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "seller_profiles_id": {
          "name": "seller_profiles_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "seller_profiles_sellerId_unique": {
          "name": "seller_profiles_sellerId_unique",
          "columns": [
            "sellerId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "settings_audit_log": {
      "name": "settings_audit_log",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "tableName": {
          "name": "tableName",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "recordKey": {
          "name": "recordKey",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fieldName": {
          "name": "fieldName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "oldValue": {
          "name": "oldValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newValue": {
          "name": "newValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "changeType": {
          "name": "changeType",
          "type": "enum('create','update','delete','rollback')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'update'"
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "userName": {
          "name": "userName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ipAddress": {
          "name": "ipAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "metadata": {
          "name": "metadata",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "site_watchers": {
      "name": "site_watchers",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "sites": {
      "name": "sites",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "siteName": {
          "name": "siteName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sectorType": {
          "name": "sectorType",
          "type": "enum('public','private')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'private'"
        },
        "classification": {
          "name": "classification",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyUrl": {
          "name": "privacyUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyMethod": {
          "name": "privacyMethod",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "contactUrl": {
          "name": "contactUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "emails": {
          "name": "emails",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteStatus": {
          "name": "siteStatus",
          "type": "enum('active','unreachable')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'active'"
        },
        "screenshotUrl": {
          "name": "screenshotUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "privacyTextUrl": {
          "name": "privacyTextUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        },
        "siteNameAr": {
          "name": "siteNameAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteNameEn": {
          "name": "siteNameEn",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteTitle": {
          "name": "siteTitle",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "siteDescription": {
          "name": "siteDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "phones": {
          "name": "phones",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "workingUrl": {
          "name": "workingUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "finalUrl": {
          "name": "finalUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "httpsWww": {
          "name": "httpsWww",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "httpsNoWww": {
          "name": "httpsNoWww",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "httpWww": {
          "name": "httpWww",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "httpNoWww": {
          "name": "httpNoWww",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mxRecords": {
          "name": "mxRecords",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cms": {
          "name": "cms",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "sslStatus": {
          "name": "sslStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {
        "sites_domain_unique": {
          "name": "sites_domain_unique",
          "columns": [
            "domain"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "smart_alerts": {
      "name": "smart_alerts",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "riskLevel": {
          "name": "riskLevel",
          "type": "enum('low','medium','high','critical')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'medium'"
        },
        "riskScore": {
          "name": "riskScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "predictedChange": {
          "name": "predictedChange",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "factors": {
          "name": "factors",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "recommendations": {
          "name": "recommendations",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "analysisData": {
          "name": "analysisData",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "acknowledgedBy": {
          "name": "acknowledgedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "acknowledgedAt": {
          "name": "acknowledgedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "system_settings": {
      "name": "system_settings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "settingKey": {
          "name": "settingKey",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "settingValue": {
          "name": "settingValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "settingType": {
          "name": "settingType",
          "type": "enum('string','number','boolean','json')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'string'"
        },
        "category": {
          "name": "category",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'general'"
        },
        "label": {
          "name": "label",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isEditable": {
          "name": "isEditable",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "system_settings_settingKey_unique": {
          "name": "system_settings_settingKey_unique",
          "columns": [
            "settingKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "theme_settings": {
      "name": "theme_settings",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "themeKey": {
          "name": "themeKey",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "themeValue": {
          "name": "themeValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "themeType": {
          "name": "themeType",
          "type": "enum('color','font','size','gradient','shadow','border','animation')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'color'"
        },
        "category": {
          "name": "category",
          "type": "enum('primary','secondary','accent','background','text','border','shadow','font','layout')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'primary'"
        },
        "label": {
          "name": "label",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "cssVariable": {
          "name": "cssVariable",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "previewValue": {
          "name": "previewValue",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 1
        },
        "updatedBy": {
          "name": "updatedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {
        "theme_settings_themeKey_unique": {
          "name": "theme_settings_themeKey_unique",
          "columns": [
            "themeKey"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "threat_rules": {
      "name": "threat_rules",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "ruleId": {
          "name": "ruleId",
          "type": "varchar(32)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleName": {
          "name": "ruleName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleNameAr": {
          "name": "ruleNameAr",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleDescription": {
          "name": "ruleDescription",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ruleDescriptionAr": {
          "name": "ruleDescriptionAr",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ruleCategory": {
          "name": "ruleCategory",
          "type": "enum('data_leak','credentials','sale_ad','db_dump','financial','health','government','telecom','education','infrastructure')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleSeverity": {
          "name": "ruleSeverity",
          "type": "enum('critical','high','medium','low')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "rulePatterns": {
          "name": "rulePatterns",
          "type": "json",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "ruleKeywords": {
          "name": "ruleKeywords",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ruleEnabled": {
          "name": "ruleEnabled",
          "type": "boolean",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": true
        },
        "ruleMatchCount": {
          "name": "ruleMatchCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "ruleLastMatchAt": {
          "name": "ruleLastMatchAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ruleCreatedAt": {
          "name": "ruleCreatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {
        "threat_rules_id": {
          "name": "threat_rules_id",
          "columns": [
            "id"
          ]
        }
      },
      "uniqueConstraints": {
        "threat_rules_ruleId_unique": {
          "name": "threat_rules_ruleId_unique",
          "columns": [
            "ruleId"
          ]
        }
      },
      "checkConstraint": {}
    },
    "training_documents": {
      "name": "training_documents",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "fileName": {
          "name": "fileName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fileUrl": {
          "name": "fileUrl",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "fileSize": {
          "name": "fileSize",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mimeType": {
          "name": "mimeType",
          "type": "varchar(100)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "status": {
          "name": "status",
          "type": "enum('pending','processing','completed','failed')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'pending'"
        },
        "extractedContent": {
          "name": "extractedContent",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "chunksCount": {
          "name": "chunksCount",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": 0
        },
        "uploadedBy": {
          "name": "uploadedBy",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "user_dashboard_widgets": {
      "name": "user_dashboard_widgets",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "widgetType": {
          "name": "widgetType",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "title": {
          "name": "title",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "position": {
          "name": "position",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "gridWidth": {
          "name": "gridWidth",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "isVisible": {
          "name": "isVisible",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "config": {
          "name": "config",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "user_sessions": {
      "name": "user_sessions",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "sessionToken": {
          "name": "sessionToken",
          "type": "varchar(512)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "deviceInfo": {
          "name": "deviceInfo",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "ipAddress": {
          "name": "ipAddress",
          "type": "varchar(45)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isActive": {
          "name": "isActive",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        },
        "expiresAt": {
          "name": "expiresAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "lastActivity": {
          "name": "lastActivity",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "users": {
      "name": "users",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "openId": {
          "name": "openId",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "email": {
          "name": "email",
          "type": "varchar(320)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "loginMethod": {
          "name": "loginMethod",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "role": {
          "name": "role",
          "type": "enum('user','admin')",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'user'"
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "updatedAt": {
          "name": "updatedAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "onUpdate": true,
          "default": "(now())"
        },
        "lastSignedIn": {
          "name": "lastSignedIn",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        },
        "rasidRole": {
          "name": "rasidRole",
          "type": "enum('root','admin','smart_monitor_manager','monitoring_director','monitoring_specialist','monitoring_officer','requester','respondent','ndmo_desk','legal_advisor','director','board_secretary','auditor')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'monitoring_officer'"
        },
        "username": {
          "name": "username",
          "type": "varchar(64)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "passwordHash": {
          "name": "passwordHash",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "displayName": {
          "name": "displayName",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mobile": {
          "name": "mobile",
          "type": "varchar(20)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "failedLoginAttempts": {
          "name": "failedLoginAttempts",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "lockedUntil": {
          "name": "lockedUntil",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "emailNotifications": {
          "name": "emailNotifications",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 1
        }
      },
      "indexes": {
        "users_openId_unique": {
          "name": "users_openId_unique",
          "columns": [
            "openId"
          ],
          "isUnique": false
        },
        "users_username_unique": {
          "name": "users_username_unique",
          "columns": [
            "username"
          ],
          "isUnique": false
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    },
    "visual_alerts": {
      "name": "visual_alerts",
      "columns": {
        "id": {
          "name": "id",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": true
        },
        "siteId": {
          "name": "siteId",
          "type": "int",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "domain": {
          "name": "domain",
          "type": "varchar(255)",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "siteName": {
          "name": "siteName",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "alertType": {
          "name": "alertType",
          "type": "enum('status_change','score_change','policy_added','policy_removed','clause_change')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'status_change'"
        },
        "severity": {
          "name": "severity",
          "type": "enum('info','warning','critical','success')",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": "'info'"
        },
        "previousStatus": {
          "name": "previousStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newStatus": {
          "name": "newStatus",
          "type": "varchar(50)",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "previousScore": {
          "name": "previousScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "newScore": {
          "name": "newScore",
          "type": "float",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "message": {
          "name": "message",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "details": {
          "name": "details",
          "type": "json",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "isRead": {
          "name": "isRead",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "isDismissed": {
          "name": "isDismissed",
          "type": "tinyint",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": 0
        },
        "userId": {
          "name": "userId",
          "type": "int",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "createdAt": {
          "name": "createdAt",
          "type": "timestamp",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "'CURRENT_TIMESTAMP'"
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {},
      "checkConstraint": {}
    }
  },
  "views": {},
  "_meta": {
    "schemas": {},
    "tables": {},
    "columns": {}
  },
  "internal": {
    "tables": {},
    "indexes": {}
  }
}
```

---

## `drizzle/meta/_journal.json`

```json
{
  "version": "7",
  "dialect": "mysql",
  "entries": [
    {
      "idx": 0,
      "version": "5",
      "when": 1771351440090,
      "tag": "0000_condemned_mongoose",
      "breakpoints": true
    }
  ]
}
```

---

