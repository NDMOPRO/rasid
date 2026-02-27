# rasid - manus-db

> Auto-extracted source code documentation

---

## `.manus/db/db-query-1771347048947.json`

```json
{
  "query": "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS users; SET FOREIGN_KEY_CHECKS = 1;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS users; SET FOREIGN_KEY_CHECKS = 1;",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 2453
}
```

---

## `.manus/db/db-query-1771347073089.json`

```json
{
  "query": "SHOW TABLES;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW TABLES;",
  "rows": [
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "__drizzle_migrations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "activity_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_audit_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_feature_flags"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_group_memberships"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_group_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_groups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_menu_items"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_menus"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_role_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_theme_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_user_overrides"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_user_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_chat_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_chat_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_conversations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_custom_commands"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_feedback"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_ratings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_response_ratings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_scenarios"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_search_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_task_state"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_training_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_user_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "alert_contacts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "alert_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "alert_rules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "api_keys"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "app_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "approvals"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "audit_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "batch_scan_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "bulk_analysis_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "bulk_analysis_results"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "case_comments"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "case_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "cases"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "change_detection_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "channels"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_conversations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_change_notifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "content_blocks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "custom_actions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dark_web_listings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dashboard_snapshots"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "data_transfer_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "deep_scan_queue"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "email_notification_prefs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "escalation_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "escalation_rules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "evidence_chain"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "executive_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "executive_reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "feedback_entries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_certifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "kb_search_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_base"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_graph_edges"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_graph_nodes"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "kpi_targets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "leaks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "letters"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "message_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "mobile_apps"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "monitoring_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "notifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "osint_queries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "page_configs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "password_reset_tokens"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "paste_entries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pdf_report_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "personality_scenarios"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pii_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_analytics"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_users"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "presentation_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "presentations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_audit"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_executions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "retention_policies"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "saved_filters"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scan_schedules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "schedule_executions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scheduled_reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "seller_profiles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "settings_audit_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_watchers"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "sites"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "smart_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "system_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "theme_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "threat_rules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "training_documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_dashboard_widgets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "visual_alerts"
    }
  ],
  "messages": [],
  "stdout": "Tables_in_HncdBnCn7T8RAKFc6RDhtp\n__drizzle_migrations\nactivity_logs\nadmin_audit_logs\nadmin_feature_flags\nadmin_group_memberships\nadmin_group_permissions\nadmin_groups\nadmin_menu_items\nadmin_menus\nadmin_permissions\nadmin_role_permissions\nadmin_roles\nadmin_theme_settings\nadmin_user_overrides\nadmin_user_roles\nai_chat_messages\nai_chat_sessions\nai_conversations\nai_custom_commands\nai_feedback\nai_messages\nai_ratings\nai_response_ratings\nai_scenarios\nai_search_log\nai_task_state\nai_training_logs\nai_user_sessions\nalert_contacts\nalert_history\nalert_rules\napi_keys\napp_scans\napprovals\naudit_log\nbatch_scan_jobs\nbulk_analysis_jobs\nbulk_analysis_results\ncase_comments\ncase_history\ncases\nchange_detection_logs\nchannels\nchat_conversations\nchat_history\nchat_messages\ncompliance_alerts\ncompliance_change_notifications\ncontent_blocks\ncustom_actions\ndark_web_listings\ndashboard_snapshots\ndata_transfer_logs\ndeep_scan_queue\ndocuments\nemail_notification_prefs\nescalation_logs\nescalation_rules\nevidence_chain\nexecutive_alerts\nexecutive_reports\nfeedback_entries\nincident_certifications\nincident_documents\nkb_search_log\nknowledge_base\nknowledge_graph_edges\nknowledge_graph_nodes\nkpi_targets\nleaks\nletters\nmessage_templates\nmobile_apps\nmonitoring_jobs\nnotifications\nosint_queries\npage_configs\npassword_reset_tokens\npaste_entries\npdf_report_history\npersonality_scenarios\npii_scans\nplatform_analytics\nplatform_settings\nplatform_users\npresentation_templates\npresentations\nreport_audit\nreport_executions\nreports\nretention_policies\nsaved_filters\nscan_schedules\nscans\nschedule_executions\nscheduled_reports\nseller_profiles\nsettings_audit_log\nsite_watchers\nsites\nsmart_alerts\nsystem_settings\ntheme_settings\nthreat_rules\ntraining_documents\nuser_dashboard_widgets\nuser_sessions\nvisual_alerts\n",
  "stderr": "",
  "execution_time_ms": 1510
}
```

---

## `.manus/db/db-query-1771347101136.json`

```json
{
  "query": "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME;",
  "rows": [
    {
      "TABLE_NAME": "__drizzle_migrations"
    },
    {
      "TABLE_NAME": "activity_logs"
    },
    {
      "TABLE_NAME": "admin_audit_logs"
    },
    {
      "TABLE_NAME": "admin_feature_flags"
    },
    {
      "TABLE_NAME": "admin_group_memberships"
    },
    {
      "TABLE_NAME": "admin_group_permissions"
    },
    {
      "TABLE_NAME": "admin_groups"
    },
    {
      "TABLE_NAME": "admin_menu_items"
    },
    {
      "TABLE_NAME": "admin_menus"
    },
    {
      "TABLE_NAME": "admin_permissions"
    },
    {
      "TABLE_NAME": "admin_role_permissions"
    },
    {
      "TABLE_NAME": "admin_roles"
    },
    {
      "TABLE_NAME": "admin_theme_settings"
    },
    {
      "TABLE_NAME": "admin_user_overrides"
    },
    {
      "TABLE_NAME": "admin_user_roles"
    },
    {
      "TABLE_NAME": "ai_chat_messages"
    },
    {
      "TABLE_NAME": "ai_chat_sessions"
    },
    {
      "TABLE_NAME": "ai_conversations"
    },
    {
      "TABLE_NAME": "ai_custom_commands"
    },
    {
      "TABLE_NAME": "ai_feedback"
    },
    {
      "TABLE_NAME": "ai_messages"
    },
    {
      "TABLE_NAME": "ai_ratings"
    },
    {
      "TABLE_NAME": "ai_response_ratings"
    },
    {
      "TABLE_NAME": "ai_scenarios"
    },
    {
      "TABLE_NAME": "ai_search_log"
    },
    {
      "TABLE_NAME": "ai_task_state"
    },
    {
      "TABLE_NAME": "ai_training_logs"
    },
    {
      "TABLE_NAME": "ai_user_sessions"
    },
    {
      "TABLE_NAME": "alert_contacts"
    },
    {
      "TABLE_NAME": "alert_history"
    },
    {
      "TABLE_NAME": "alert_rules"
    },
    {
      "TABLE_NAME": "api_keys"
    },
    {
      "TABLE_NAME": "app_scans"
    },
    {
      "TABLE_NAME": "approvals"
    },
    {
      "TABLE_NAME": "audit_log"
    },
    {
      "TABLE_NAME": "batch_scan_jobs"
    },
    {
      "TABLE_NAME": "bulk_analysis_jobs"
    },
    {
      "TABLE_NAME": "bulk_analysis_results"
    },
    {
      "TABLE_NAME": "case_comments"
    },
    {
      "TABLE_NAME": "case_history"
    },
    {
      "TABLE_NAME": "cases"
    },
    {
      "TABLE_NAME": "change_detection_logs"
    },
    {
      "TABLE_NAME": "channels"
    },
    {
      "TABLE_NAME": "chat_conversations"
    },
    {
      "TABLE_NAME": "chat_history"
    },
    {
      "TABLE_NAME": "chat_messages"
    },
    {
      "TABLE_NAME": "compliance_alerts"
    },
    {
      "TABLE_NAME": "compliance_change_notifications"
    },
    {
      "TABLE_NAME": "content_blocks"
    },
    {
      "TABLE_NAME": "custom_actions"
    },
    {
      "TABLE_NAME": "dark_web_listings"
    },
    {
      "TABLE_NAME": "dashboard_snapshots"
    },
    {
      "TABLE_NAME": "data_transfer_logs"
    },
    {
      "TABLE_NAME": "deep_scan_queue"
    },
    {
      "TABLE_NAME": "documents"
    },
    {
      "TABLE_NAME": "email_notification_prefs"
    },
    {
      "TABLE_NAME": "escalation_logs"
    },
    {
      "TABLE_NAME": "escalation_rules"
    },
    {
      "TABLE_NAME": "evidence_chain"
    },
    {
      "TABLE_NAME": "executive_alerts"
    },
    {
      "TABLE_NAME": "executive_reports"
    },
    {
      "TABLE_NAME": "feedback_entries"
    },
    {
      "TABLE_NAME": "incident_certifications"
    },
    {
      "TABLE_NAME": "incident_documents"
    },
    {
      "TABLE_NAME": "kb_search_log"
    },
    {
      "TABLE_NAME": "knowledge_base"
    },
    {
      "TABLE_NAME": "knowledge_graph_edges"
    },
    {
      "TABLE_NAME": "knowledge_graph_nodes"
    },
    {
      "TABLE_NAME": "kpi_targets"
    },
    {
      "TABLE_NAME": "leaks"
    },
    {
      "TABLE_NAME": "letters"
    },
    {
      "TABLE_NAME": "message_templates"
    },
    {
      "TABLE_NAME": "mobile_apps"
    },
    {
      "TABLE_NAME": "monitoring_jobs"
    },
    {
      "TABLE_NAME": "notifications"
    },
    {
      "TABLE_NAME": "osint_queries"
    },
    {
      "TABLE_NAME": "page_configs"
    },
    {
      "TABLE_NAME": "password_reset_tokens"
    },
    {
      "TABLE_NAME": "paste_entries"
    },
    {
      "TABLE_NAME": "pdf_report_history"
    },
    {
      "TABLE_NAME": "personality_scenarios"
    },
    {
      "TABLE_NAME": "pii_scans"
    },
    {
      "TABLE_NAME": "platform_analytics"
    },
    {
      "TABLE_NAME": "platform_settings"
    },
    {
      "TABLE_NAME": "platform_users"
    },
    {
      "TABLE_NAME": "presentation_templates"
    },
    {
      "TABLE_NAME": "presentations"
    },
    {
      "TABLE_NAME": "report_audit"
    },
    {
      "TABLE_NAME": "report_executions"
    },
    {
      "TABLE_NAME": "reports"
    },
    {
      "TABLE_NAME": "retention_policies"
    },
    {
      "TABLE_NAME": "saved_filters"
    },
    {
      "TABLE_NAME": "scan_schedules"
    },
    {
      "TABLE_NAME": "scans"
    },
    {
      "TABLE_NAME": "schedule_executions"
    },
    {
      "TABLE_NAME": "scheduled_reports"
    },
    {
      "TABLE_NAME": "seller_profiles"
    },
    {
      "TABLE_NAME": "settings_audit_log"
    },
    {
      "TABLE_NAME": "site_watchers"
    },
    {
      "TABLE_NAME": "sites"
    },
    {
      "TABLE_NAME": "smart_alerts"
    },
    {
      "TABLE_NAME": "system_settings"
    },
    {
      "TABLE_NAME": "theme_settings"
    },
    {
      "TABLE_NAME": "threat_rules"
    },
    {
      "TABLE_NAME": "training_documents"
    },
    {
      "TABLE_NAME": "user_dashboard_widgets"
    },
    {
      "TABLE_NAME": "user_sessions"
    },
    {
      "TABLE_NAME": "visual_alerts"
    }
  ],
  "messages": [],
  "stdout": "TABLE_NAME\n__drizzle_migrations\nactivity_logs\nadmin_audit_logs\nadmin_feature_flags\nadmin_group_memberships\nadmin_group_permissions\nadmin_groups\nadmin_menu_items\nadmin_menus\nadmin_permissions\nadmin_role_permissions\nadmin_roles\nadmin_theme_settings\nadmin_user_overrides\nadmin_user_roles\nai_chat_messages\nai_chat_sessions\nai_conversations\nai_custom_commands\nai_feedback\nai_messages\nai_ratings\nai_response_ratings\nai_scenarios\nai_search_log\nai_task_state\nai_training_logs\nai_user_sessions\nalert_contacts\nalert_history\nalert_rules\napi_keys\napp_scans\napprovals\naudit_log\nbatch_scan_jobs\nbulk_analysis_jobs\nbulk_analysis_results\ncase_comments\ncase_history\ncases\nchange_detection_logs\nchannels\nchat_conversations\nchat_history\nchat_messages\ncompliance_alerts\ncompliance_change_notifications\ncontent_blocks\ncustom_actions\ndark_web_listings\ndashboard_snapshots\ndata_transfer_logs\ndeep_scan_queue\ndocuments\nemail_notification_prefs\nescalation_logs\nescalation_rules\nevidence_chain\nexecutive_alerts\nexecutive_reports\nfeedback_entries\nincident_certifications\nincident_documents\nkb_search_log\nknowledge_base\nknowledge_graph_edges\nknowledge_graph_nodes\nkpi_targets\nleaks\nletters\nmessage_templates\nmobile_apps\nmonitoring_jobs\nnotifications\nosint_queries\npage_configs\npassword_reset_tokens\npaste_entries\npdf_report_history\npersonality_scenarios\npii_scans\nplatform_analytics\nplatform_settings\nplatform_users\npresentation_templates\npresentations\nreport_audit\nreport_executions\nreports\nretention_policies\nsaved_filters\nscan_schedules\nscans\nschedule_executions\nscheduled_reports\nseller_profiles\nsettings_audit_log\nsite_watchers\nsites\nsmart_alerts\nsystem_settings\ntheme_settings\nthreat_rules\ntraining_documents\nuser_dashboard_widgets\nuser_sessions\nvisual_alerts\n",
  "stderr": "",
  "execution_time_ms": 1548
}
```

---

## `.manus/db/db-query-1771347223041.json`

```json
{
  "query": "SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE();",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE();",
  "rows": [
    {
      "table_count": "43"
    }
  ],
  "messages": [],
  "stdout": "table_count\n43\n",
  "stderr": "",
  "execution_time_ms": 1507
}
```

---

## `.manus/db/db-query-1771348738729.json`

```json
{
  "query": "INSERT INTO users (openId, name, email, phone, role, department, organization, isActive) VALUES\n('MRUHAILY', 'Muhammed ALRuhaily', 'prog.muhammed@gmail.com', '+966553445533', 'superadmin', 'IT', 'NDMO', true),\n('aalrebdi', 'Alrebdi Fahad Alrebdi', 'aalrebdi@ndmo.gov.sa', NULL, 'admin', 'Presidency', 'NDMO', true),\n('msarhan', 'Mashal Abdullah Alsarhan', 'msarhan@nic.gov.sa', '0555113675', 'admin', 'Vice Presidency', 'NDMO', true),\n('malmoutaz', 'Manal Mohammed Almoutaz', 'malmoutaz@ndmo.gov.sa', '0542087872', 'admin', 'Smart Rasid Platform', 'NDMO', true)\nON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), phone=VALUES(phone), role=VALUES(role), department=VALUES(department), organization=VALUES(organization);",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO users (openId, name, email, phone, role, department, organization, isActive) VALUES\n('MRUHAILY', 'Muhammed ALRuhaily', 'prog.muhammed@gmail.com', '+966553445533', 'superadmin', 'IT', 'NDMO', true),\n('aalrebdi', 'Alrebdi Fahad Alrebdi', 'aalrebdi@ndmo.gov.sa', NULL, 'admin', 'Presidency', 'NDMO', true),\n('msarhan', 'Mashal Abdullah Alsarhan', 'msarhan@nic.gov.sa', '0555113675', 'admin', 'Vice Presidency', 'NDMO', true),\n('malmoutaz', 'Manal Mohammed Almoutaz', 'malmoutaz@ndmo.gov.sa', '0542087872', 'admin', 'Smart Rasid Platform', 'NDMO', true)\nON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), phone=VALUES(phone), role=VALUES(role), department=VALUES(department), organization=VALUES(organization);",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1573
}
```

---

## `.manus/db/db-query-1771348769584.json`

```json
{
  "query": "INSERT INTO glossary_terms (term, definition, relatedPage) VALUES\n('الامتثال', 'مدى التزام الموقع الإلكتروني بمتطلبات نظام حماية البيانات الشخصية', '/app/privacy'),\n('سياسة الخصوصية', 'وثيقة قانونية تحدد كيفية جمع واستخدام وحماية البيانات الشخصية', '/app/privacy'),\n('واقعة تسرب', 'حادثة أمنية تؤدي إلى كشف أو فقدان بيانات شخصية بشكل غير مصرح به', '/app/incidents'),\n('البيانات الشخصية', 'أي بيانات تتعلق بشخص طبيعي محدد أو يمكن تحديده', '/app/privacy'),\n('المتابعة', 'إجراء رقابي يتم اتخاذه بعد رصد مخالفة أو واقعة', '/app/followups'),\n('التقرير', 'وثيقة رسمية تلخص نتائج الرصد والتحليل', '/app/reports'),\n('فئة البيانات', 'تصنيف نوع البيانات الشخصية المتسربة مثل بيانات مالية أو صحية', '/app/incidents'),\n('مستوى الحساسية', 'درجة خطورة البيانات المتسربة: منخفض، متوسط، عالٍ، حرج', '/app/incidents'),\n('الأثر', 'مقياس تأثير واقعة التسرب على الأفراد والجهات المتضررة', '/app/incidents'),\n('الجهة المشرفة', 'الجهة الحكومية المسؤولة عن الرقابة على حماية البيانات الشخصية', '/app/overview');",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO glossary_terms (term, definition, relatedPage) VALUES\n('الامتثال', 'مدى التزام الموقع الإلكتروني بمتطلبات نظام حماية البيانات الشخصية', '/app/privacy'),\n('سياسة الخصوصية', 'وثيقة قانونية تحدد كيفية جمع واستخدام وحماية البيانات الشخصية', '/app/privacy'),\n('واقعة تسرب', 'حادثة أمنية تؤدي إلى كشف أو فقدان بيانات شخصية بشكل غير مصرح به', '/app/incidents'),\n('البيانات الشخصية', 'أي بيانات تتعلق بشخص طبيعي محدد أو يمكن تحديده', '/app/privacy'),\n('المتابعة', 'إجراء رقابي يتم اتخاذه بعد رصد مخالفة أو واقعة', '/app/followups'),\n('التقرير', 'وثيقة رسمية تلخص نتائج الرصد والتحليل', '/app/reports'),\n('فئة البيانات', 'تصنيف نوع البيانات الشخصية المتسربة مثل بيانات مالية أو صحية', '/app/incidents'),\n('مستوى الحساسية', 'درجة خطورة البيانات المتسربة: منخفض، متوسط، عالٍ، حرج', '/app/incidents'),\n('الأثر', 'مقياس تأثير واقعة التسرب على الأفراد والجهات المتضررة', '/app/incidents'),\n('الجهة المشرفة', 'الجهة الحكومية المسؤولة عن الرقابة على حماية البيانات الشخصية', '/app/overview');",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1502
}
```

---

## `.manus/db/db-query-1771348813367.json`

```json
{
  "query": "INSERT INTO page_descriptors (pageSlug, purpose, suggestedQuestions) VALUES\n('/app/overview', 'الصفحة الرئيسية للمنصة تعرض ملخص شامل لحالة الامتثال والوقائع والمتابعات', '[\"أعطني ملخصاً عاماً\",\"كم موقع ممتثل؟\",\"كم واقعة تسرب مفتوحة؟\",\"ما المتابعات المتأخرة؟\"]'),\n('/app/privacy', 'لوحة تفصيلية لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية', '[\"ما نسبة الامتثال؟\",\"كم موقع بدون سياسة خصوصية؟\",\"أظهر التغييرات الجوهرية\",\"ما المواقع بدون قنوات تواصل؟\"]'),\n('/app/privacy/sites', 'جدول شامل لجميع المواقع المرصودة مع حالة الامتثال والتفاصيل', '[\"كم موقع غير ممتثل؟\",\"أظهر المواقع بدون سياسة\",\"ما المواقع التي لا تعمل؟\"]'),\n('/app/incidents', 'لوحة تفصيلية لمتابعة وقائع تسرب البيانات الشخصية', '[\"كم واقعة مؤكدة؟\",\"ما أعلى فئات البيانات المتسربة؟\",\"أظهر الوقائع حسب الأثر\"]'),\n('/app/incidents/list', 'جدول شامل لجميع وقائع تسرب البيانات مع التفاصيل والحالة', '[\"لخص آخر واقعة\",\"كم واقعة قيد التحقق؟\",\"أظهر الوقائع عالية الأثر\"]'),\n('/app/followups', 'قائمة المتابعات والإجراءات الرقابية المتخذة', '[\"كم متابعة مفتوحة؟\",\"ما المتابعات المتأخرة؟\",\"أظهر المتابعات حسب الأولوية\"]'),\n('/app/reports', 'إنشاء وإدارة التقارير الرسمية والدورية', '[\"أنشئ تقريراً شهرياً\",\"ما التقارير المجدولة؟\",\"أظهر آخر التقارير\"]'),\n('/app/my', 'لوحة مؤشرات قابلة للتخصيص حسب احتياجات المستخدم', '[\"كيف أخصص لوحتي؟\",\"أضف ويدجت جديد\",\"احفظ التخطيط الحالي\"]'),\n('/app/smart-rasid', 'المساعد التشغيلي الذكي للمنصة', '[\"أعطني ملخصاً عاماً\",\"اكتب رسالة رسمية\",\"حلل بيانات الامتثال\",\"ابدأ دليلاً حياً\"]');",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO page_descriptors (pageSlug, purpose, suggestedQuestions) VALUES\n('/app/overview', 'الصفحة الرئيسية للمنصة تعرض ملخص شامل لحالة الامتثال والوقائع والمتابعات', '[\"أعطني ملخصاً عاماً\",\"كم موقع ممتثل؟\",\"كم واقعة تسرب مفتوحة؟\",\"ما المتابعات المتأخرة؟\"]'),\n('/app/privacy', 'لوحة تفصيلية لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية', '[\"ما نسبة الامتثال؟\",\"كم موقع بدون سياسة خصوصية؟\",\"أظهر التغييرات الجوهرية\",\"ما المواقع بدون قنوات تواصل؟\"]'),\n('/app/privacy/sites', 'جدول شامل لجميع المواقع المرصودة مع حالة الامتثال والتفاصيل', '[\"كم موقع غير ممتثل؟\",\"أظهر المواقع بدون سياسة\",\"ما المواقع التي لا تعمل؟\"]'),\n('/app/incidents', 'لوحة تفصيلية لمتابعة وقائع تسرب البيانات الشخصية', '[\"كم واقعة مؤكدة؟\",\"ما أعلى فئات البيانات المتسربة؟\",\"أظهر الوقائع حسب الأثر\"]'),\n('/app/incidents/list', 'جدول شامل لجميع وقائع تسرب البيانات مع التفاصيل والحالة', '[\"لخص آخر واقعة\",\"كم واقعة قيد التحقق؟\",\"أظهر الوقائع عالية الأثر\"]'),\n('/app/followups', 'قائمة المتابعات والإجراءات الرقابية المتخذة', '[\"كم متابعة مفتوحة؟\",\"ما المتابعات المتأخرة؟\",\"أظهر المتابعات حسب الأولوية\"]'),\n('/app/reports', 'إنشاء وإدارة التقارير الرسمية والدورية', '[\"أنشئ تقريراً شهرياً\",\"ما التقارير المجدولة؟\",\"أظهر آخر التقارير\"]'),\n('/app/my', 'لوحة مؤشرات قابلة للتخصيص حسب احتياجات المستخدم', '[\"كيف أخصص لوحتي؟\",\"أضف ويدجت جديد\",\"احفظ التخطيط الحالي\"]'),\n('/app/smart-rasid', 'المساعد التشغيلي الذكي للمنصة', '[\"أعطني ملخصاً عاماً\",\"اكتب رسالة رسمية\",\"حلل بيانات الامتثال\",\"ابدأ دليلاً حياً\"]');",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1539
}
```

---

## `.manus/db/db-query-1771348820222.json`

```json
{
  "query": "SELECT id, openId, name, role, email FROM users;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT id, openId, name, role, email FROM users;",
  "rows": [
    {
      "id": "1",
      "openId": "PnwcCkcjA7o8PKfEtmMJvR",
      "name": "Moe",
      "role": "user",
      "email": "raneemndmo@gmail.com"
    },
    {
      "id": "2",
      "openId": "MRUHAILY",
      "name": "Muhammed ALRuhaily",
      "role": "superadmin",
      "email": "prog.muhammed@gmail.com"
    },
    {
      "id": "3",
      "openId": "aalrebdi",
      "name": "Alrebdi Fahad Alrebdi",
      "role": "admin",
      "email": "aalrebdi@ndmo.gov.sa"
    },
    {
      "id": "4",
      "openId": "msarhan",
      "name": "Mashal Abdullah Alsarhan",
      "role": "admin",
      "email": "msarhan@nic.gov.sa"
    },
    {
      "id": "5",
      "openId": "malmoutaz",
      "name": "Manal Mohammed Almoutaz",
      "role": "admin",
      "email": "malmoutaz@ndmo.gov.sa"
    }
  ],
  "messages": [],
  "stdout": "id\topenId\tname\trole\temail\n1\tPnwcCkcjA7o8PKfEtmMJvR\tMoe\tuser\traneemndmo@gmail.com\n2\tMRUHAILY\tMuhammed ALRuhaily\tsuperadmin\tprog.muhammed@gmail.com\n3\taalrebdi\tAlrebdi Fahad Alrebdi\tadmin\taalrebdi@ndmo.gov.sa\n4\tmsarhan\tMashal Abdullah Alsarhan\tadmin\tmsarhan@nic.gov.sa\n5\tmalmoutaz\tManal Mohammed Almoutaz\tadmin\tmalmoutaz@ndmo.gov.sa\n",
  "stderr": "",
  "execution_time_ms": 1492
}
```

---

## `.manus/db/db-query-1771351453080.json`

```json
{
  "query": "SHOW TABLES;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW TABLES;",
  "rows": [
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "__drizzle_migrations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_conversations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_task_state"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "approvals"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "audit_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "backups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "breach_sources"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "catalogs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_clauses"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dashboard_layouts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "feature_flags"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "followup_tasks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "followups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "glossary_terms"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "group_members"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "groups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "guide_catalog"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_attachments"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_datasets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_timeline"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incidents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "letters"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "menus"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "message_templates_catalog"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "notifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "page_descriptors"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "privacy_policy_versions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scheduled_reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_requirements"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "sites"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "system_events"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "threat_actors"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ui_policies"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "users"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "verification_records"
    }
  ],
  "messages": [],
  "stdout": "Tables_in_HncdBnCn7T8RAKFc6RDhtp\n__drizzle_migrations\nai_conversations\nai_messages\nai_task_state\napprovals\naudit_log\nbackups\nbreach_sources\ncatalogs\ncompliance_clauses\ndashboard_layouts\nfeature_flags\nfollowup_tasks\nfollowups\nglossary_terms\ngroup_members\ngroups\nguide_catalog\nincident_attachments\nincident_datasets\nincident_timeline\nincidents\nletters\nmenus\nmessage_templates_catalog\nnotifications\npage_descriptors\npages\nplatform_settings\nprivacy_policy_versions\nreport_templates\nreports\nroles\nscheduled_reports\nsite_requirements\nsite_scans\nsites\nsystem_events\nthreat_actors\nui_policies\nuser_roles\nusers\nverification_records\n",
  "stderr": "",
  "execution_time_ms": 1557
}
```

---

## `.manus/db/db-query-1771354702444.json`

```json
{
  "query": "SELECT COUNT(*) as cnt FROM platform_settings;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COUNT(*) as cnt FROM platform_settings;",
  "rows": [
    {
      "cnt": "0"
    }
  ],
  "messages": [],
  "stdout": "cnt\n0\n",
  "stderr": "",
  "execution_time_ms": 1579
}
```

---

## `.manus/db/db-query-1771354710019.json`

```json
{
  "query": "SELECT settingKey, settingValue FROM platform_settings LIMIT 5;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT settingKey, settingValue FROM platform_settings LIMIT 5;",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1568
}
```

---

## `.manus/db/db-query-1771354728580.json`

```json
{
  "query": "DESCRIBE platform_settings;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute DESCRIBE platform_settings;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "settingKey",
      "Type": "varchar(200)",
      "Null": "NO",
      "Key": "MUL",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingValue",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingType",
      "Type": "varchar(50)",
      "Null": "YES",
      "Key": "",
      "Default": "string",
      "Extra": ""
    },
    {
      "Field": "category",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "description",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "updatedBy",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nsettingKey\tvarchar(200)\tNO\tMUL\tNULL\t\nsettingValue\ttext\tYES\t\tNULL\t\nsettingType\tvarchar(50)\tYES\t\tstring\t\ncategory\tvarchar(100)\tYES\t\tNULL\t\ndescription\ttext\tYES\t\tNULL\t\nupdatedBy\tint(11)\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\n",
  "stderr": "",
  "execution_time_ms": 1500
}
```

---

## `.manus/db/db-query-1771354751427.json`

```json
{
  "query": "SHOW COLUMNS FROM platform_settings;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW COLUMNS FROM platform_settings;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "settingKey",
      "Type": "varchar(200)",
      "Null": "NO",
      "Key": "MUL",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingValue",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingType",
      "Type": "varchar(50)",
      "Null": "YES",
      "Key": "",
      "Default": "string",
      "Extra": ""
    },
    {
      "Field": "category",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "description",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "updatedBy",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nsettingKey\tvarchar(200)\tNO\tMUL\tNULL\t\nsettingValue\ttext\tYES\t\tNULL\t\nsettingType\tvarchar(50)\tYES\t\tstring\t\ncategory\tvarchar(100)\tYES\t\tNULL\t\ndescription\ttext\tYES\t\tNULL\t\nupdatedBy\tint(11)\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\n",
  "stderr": "",
  "execution_time_ms": 1513
}
```

---

## `.manus/db/db-query-1771354761546.json`

```json
{
  "query": "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_settings' ORDER BY ORDINAL_POSITION;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_settings' ORDER BY ORDINAL_POSITION;",
  "rows": [
    {
      "COLUMN_NAME": "id"
    },
    {
      "COLUMN_NAME": "settingKey"
    },
    {
      "COLUMN_NAME": "settingValue"
    },
    {
      "COLUMN_NAME": "settingType"
    },
    {
      "COLUMN_NAME": "category"
    },
    {
      "COLUMN_NAME": "description"
    },
    {
      "COLUMN_NAME": "updatedBy"
    },
    {
      "COLUMN_NAME": "createdAt"
    },
    {
      "COLUMN_NAME": "updatedAt"
    }
  ],
  "messages": [],
  "stdout": "COLUMN_NAME\nid\nsettingKey\nsettingValue\nsettingType\ncategory\ndescription\nupdatedBy\ncreatedAt\nupdatedAt\n",
  "stderr": "",
  "execution_time_ms": 1513
}
```

---

## `.manus/db/db-query-1771354773075.json`

```json
{
  "query": "ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS label TEXT, ADD COLUMN IF NOT EXISTS labelEn TEXT, ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS isEditable TINYINT DEFAULT 1, ADD COLUMN IF NOT EXISTS sortOrder INT DEFAULT 0, ADD COLUMN IF NOT EXISTS updatedBy INT;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS label TEXT, ADD COLUMN IF NOT EXISTS labelEn TEXT, ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS isEditable TINYINT DEFAULT 1, ADD COLUMN IF NOT EXISTS sortOrder INT DEFAULT 0, ADD COLUMN IF NOT EXISTS updatedBy INT;",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 2769
}
```

---

## `.manus/db/db-query-1771354786947.json`

```json
{
  "query": "INSERT INTO platform_settings (settingKey, settingValue, settingType, category, label, labelEn, description, isEditable, sortOrder) VALUES\n('platform_name', 'منصة راصد الذكية', 'string', 'branding', 'اسم المنصة', 'Platform Name', 'اسم المنصة الرئيسي', 1, 1),\n('platform_name_en', 'Smart Rasid Platform', 'string', 'branding', 'اسم المنصة بالإنجليزية', 'Platform Name EN', 'English platform name', 1, 2),\n('organization_name', 'مكتب إدارة البيانات الوطنية', 'string', 'branding', 'اسم الجهة', 'Organization Name', 'اسم الجهة المالكة', 1, 3),\n('default_theme', 'dark', 'string', 'theme', 'السمة الافتراضية', 'Default Theme', 'السمة الافتراضية للمنصة', 1, 10),\n('maintenance_mode', 'false', 'boolean', 'advanced', 'وضع الصيانة', 'Maintenance Mode', 'تفعيل وضع الصيانة', 1, 20);",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO platform_settings (settingKey, settingValue, settingType, category, label, labelEn, description, isEditable, sortOrder) VALUES\n('platform_name', 'منصة راصد الذكية', 'string', 'branding', 'اسم المنصة', 'Platform Name', 'اسم المنصة الرئيسي', 1, 1),\n('platform_name_en', 'Smart Rasid Platform', 'string', 'branding', 'اسم المنصة بالإنجليزية', 'Platform Name EN', 'English platform name', 1, 2),\n('organization_name', 'مكتب إدارة البيانات الوطنية', 'string', 'branding', 'اسم الجهة', 'Organization Name', 'اسم الجهة المالكة', 1, 3),\n('default_theme', 'dark', 'string', 'theme', 'السمة الافتراضية', 'Default Theme', 'السمة الافتراضية للمنصة', 1, 10),\n('maintenance_mode', 'false', 'boolean', 'advanced', 'وضع الصيانة', 'Maintenance Mode', 'تفعيل وضع الصيانة', 1, 20);",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1533
}
```

---

## `.manus/db/db-query-1771355064525.json`

```json
{
  "query": "SHOW COLUMNS FROM scheduled_reports;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW COLUMNS FROM scheduled_reports;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "templateId",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "name",
      "Type": "varchar(500)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "schedule",
      "Type": "varchar(50)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "cronExpression",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "filters",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "recipients",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "format",
      "Type": "varchar(20)",
      "Null": "YES",
      "Key": "",
      "Default": "pdf",
      "Extra": ""
    },
    {
      "Field": "isActive",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "1",
      "Extra": ""
    },
    {
      "Field": "lastRunAt",
      "Type": "timestamp",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "nextRunAt",
      "Type": "timestamp",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdBy",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\ntemplateId\tint(11)\tNO\t\tNULL\t\nname\tvarchar(500)\tYES\t\tNULL\t\nschedule\tvarchar(50)\tYES\t\tNULL\t\ncronExpression\tvarchar(100)\tYES\t\tNULL\t\nfilters\tjson\tYES\t\tNULL\t\nrecipients\tjson\tYES\t\tNULL\t\nformat\tvarchar(20)\tYES\t\tpdf\t\nisActive\ttinyint(1)\tYES\t\t1\t\nlastRunAt\ttimestamp\tYES\t\tNULL\t\nnextRunAt\ttimestamp\tYES\t\tNULL\t\ncreatedBy\tint(11)\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\n",
  "stderr": "",
  "execution_time_ms": 1533
}
```

---

## `.manus/db/db-query-1771355630866.json`

```json
{
  "query": "SHOW COLUMNS FROM platform_settings;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW COLUMNS FROM platform_settings;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "settingKey",
      "Type": "varchar(200)",
      "Null": "NO",
      "Key": "MUL",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingValue",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "settingType",
      "Type": "varchar(50)",
      "Null": "YES",
      "Key": "",
      "Default": "string",
      "Extra": ""
    },
    {
      "Field": "category",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "description",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "updatedBy",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    },
    {
      "Field": "label",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "labelEn",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "isEditable",
      "Type": "tinyint(4)",
      "Null": "YES",
      "Key": "",
      "Default": "1",
      "Extra": ""
    },
    {
      "Field": "sortOrder",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "0",
      "Extra": ""
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nsettingKey\tvarchar(200)\tNO\tMUL\tNULL\t\nsettingValue\ttext\tYES\t\tNULL\t\nsettingType\tvarchar(50)\tYES\t\tstring\t\ncategory\tvarchar(100)\tYES\t\tNULL\t\ndescription\ttext\tYES\t\tNULL\t\nupdatedBy\tint(11)\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\nlabel\ttext\tYES\t\tNULL\t\nlabelEn\ttext\tYES\t\tNULL\t\nisEditable\ttinyint(4)\tYES\t\t1\t\nsortOrder\tint(11)\tYES\t\t0\t\n",
  "stderr": "",
  "execution_time_ms": 1547
}
```

---

## `.manus/db/db-query-1771355913751.json`

```json
{
  "query": "SHOW COLUMNS FROM users;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW COLUMNS FROM users;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "openId",
      "Type": "varchar(64)",
      "Null": "NO",
      "Key": "UNI",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "name",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "email",
      "Type": "varchar(320)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "phone",
      "Type": "varchar(20)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "loginMethod",
      "Type": "varchar(64)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "role",
      "Type": "enum('user','admin','superadmin')",
      "Null": "NO",
      "Key": "",
      "Default": "user",
      "Extra": ""
    },
    {
      "Field": "department",
      "Type": "varchar(255)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "organization",
      "Type": "varchar(255)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "avatarUrl",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "preferences",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "isActive",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "1",
      "Extra": ""
    },
    {
      "Field": "lastSignedIn",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nopenId\tvarchar(64)\tNO\tUNI\tNULL\t\nname\ttext\tYES\t\tNULL\t\nemail\tvarchar(320)\tYES\t\tNULL\t\nphone\tvarchar(20)\tYES\t\tNULL\t\nloginMethod\tvarchar(64)\tYES\t\tNULL\t\nrole\tenum('user','admin','superadmin')\tNO\t\tuser\t\ndepartment\tvarchar(255)\tYES\t\tNULL\t\norganization\tvarchar(255)\tYES\t\tNULL\t\navatarUrl\ttext\tYES\t\tNULL\t\npreferences\tjson\tYES\t\tNULL\t\nisActive\ttinyint(1)\tYES\t\t1\t\nlastSignedIn\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\n",
  "stderr": "",
  "execution_time_ms": 1560
}
```

---

## `.manus/db/db-query-1771355922306.json`

```json
{
  "query": "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' ORDER BY ORDINAL_POSITION;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' ORDER BY ORDINAL_POSITION;",
  "rows": [
    {
      "COLUMN_NAME": "id"
    },
    {
      "COLUMN_NAME": "openId"
    },
    {
      "COLUMN_NAME": "name"
    },
    {
      "COLUMN_NAME": "email"
    },
    {
      "COLUMN_NAME": "phone"
    },
    {
      "COLUMN_NAME": "loginMethod"
    },
    {
      "COLUMN_NAME": "role"
    },
    {
      "COLUMN_NAME": "department"
    },
    {
      "COLUMN_NAME": "organization"
    },
    {
      "COLUMN_NAME": "avatarUrl"
    },
    {
      "COLUMN_NAME": "preferences"
    },
    {
      "COLUMN_NAME": "isActive"
    },
    {
      "COLUMN_NAME": "lastSignedIn"
    },
    {
      "COLUMN_NAME": "createdAt"
    },
    {
      "COLUMN_NAME": "updatedAt"
    }
  ],
  "messages": [],
  "stdout": "COLUMN_NAME\nid\nopenId\nname\nemail\nphone\nloginMethod\nrole\ndepartment\norganization\navatarUrl\npreferences\nisActive\nlastSignedIn\ncreatedAt\nupdatedAt\n",
  "stderr": "",
  "execution_time_ms": 1542
}
```

---

## `.manus/db/db-query-1771355945542.json`

```json
{
  "query": "ALTER TABLE users \nADD COLUMN IF NOT EXISTS rasidRole ENUM('root','admin','smart_monitor_manager','monitoring_director','monitoring_specialist','monitoring_officer','requester','respondent','ndmo_desk','legal_advisor','director','board_secretary','auditor') DEFAULT 'monitoring_officer',\nADD COLUMN IF NOT EXISTS username VARCHAR(64),\nADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255),\nADD COLUMN IF NOT EXISTS displayName VARCHAR(255),\nADD COLUMN IF NOT EXISTS mobile VARCHAR(20),\nADD COLUMN IF NOT EXISTS failedLoginAttempts INT DEFAULT 0 NOT NULL,\nADD COLUMN IF NOT EXISTS lockedUntil TIMESTAMP NULL,\nADD COLUMN IF NOT EXISTS emailNotifications TINYINT DEFAULT 1 NOT NULL;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute ALTER TABLE users \nADD COLUMN IF NOT EXISTS rasidRole ENUM('root','admin','smart_monitor_manager','monitoring_director','monitoring_specialist','monitoring_officer','requester','respondent','ndmo_desk','legal_advisor','director','board_secretary','auditor') DEFAULT 'monitoring_officer',\nADD COLUMN IF NOT EXISTS username VARCHAR(64),\nADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255),\nADD COLUMN IF NOT EXISTS displayName VARCHAR(255),\nADD COLUMN IF NOT EXISTS mobile VARCHAR(20),\nADD COLUMN IF NOT EXISTS failedLoginAttempts INT DEFAULT 0 NOT NULL,\nADD COLUMN IF NOT EXISTS lockedUntil TIMESTAMP NULL,\nADD COLUMN IF NOT EXISTS emailNotifications TINYINT DEFAULT 1 NOT NULL;",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 5991
}
```

---

## `.manus/db/db-query-1771355974805.json`

```json
{
  "query": "UPDATE users SET username = 'MRUHAILY', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Admin Rasid System', mobile = '+966553445533', rasidRole = 'root', role = 'admin' WHERE email = 'prog.muhammed@gmail.com';\nUPDATE users SET username = 'aalrebdi', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'NDMO\\'s president/director', rasidRole = 'admin', role = 'admin' WHERE email = 'aalrebdi@ndmo.gov.sa';\nUPDATE users SET username = 'msarhan', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Vice President of NDMO', mobile = '055 511 3675', rasidRole = 'admin', role = 'admin' WHERE email = 'msarhan@nic.gov.sa';\nUPDATE users SET username = 'malmoutaz', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Manager of Smart Rasid Platform', mobile = '0542087872', rasidRole = 'smart_monitor_manager', role = 'admin' WHERE email = 'malmoutaz@ndmo.gov.sa';",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute UPDATE users SET username = 'MRUHAILY', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Admin Rasid System', mobile = '+966553445533', rasidRole = 'root', role = 'admin' WHERE email = 'prog.muhammed@gmail.com';\nUPDATE users SET username = 'aalrebdi', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'NDMO\\'s president/director', rasidRole = 'admin', role = 'admin' WHERE email = 'aalrebdi@ndmo.gov.sa';\nUPDATE users SET username = 'msarhan', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Vice President of NDMO', mobile = '055 511 3675', rasidRole = 'admin', role = 'admin' WHERE email = 'msarhan@nic.gov.sa';\nUPDATE users SET username = 'malmoutaz', passwordHash = '$2b$10$YDlwOUf0rQmm7Gqreek0SOsCwYz4TjGgfJofQvY9SF/LjIP1hSIo6', displayName = 'Manager of Smart Rasid Platform', mobile = '0542087872', rasidRole = 'smart_monitor_manager', role = 'admin' WHERE email = 'malmoutaz@ndmo.gov.sa';",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 2322
}
```

---

## `.manus/db/db-query-1771363847194.json`

```json
{
  "query": "SHOW TABLES;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW TABLES;",
  "rows": [
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "__drizzle_migrations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "activity_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_audit_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_feature_flags"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_group_memberships"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_group_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_groups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_menu_items"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_menus"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_role_permissions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_theme_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_user_overrides"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "admin_user_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_chat_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_chat_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_conversations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_custom_commands"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_feedback"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_ratings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_response_ratings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_scenarios"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_search_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_task_state"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_training_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ai_user_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "alert_contacts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "alert_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "api_keys"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "app_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "approvals"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "audit_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "backups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "batch_scan_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "breach_sources"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "bulk_analysis_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "bulk_analysis_results"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "case_comments"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "case_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "cases"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "catalogs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "change_detection_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "channels"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_conversations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "chat_messages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_change_notifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "compliance_clauses"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "content_blocks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "custom_actions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dark_web_listings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dashboard_layouts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "dashboard_snapshots"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "data_transfer_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "deep_scan_queue"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "email_notification_prefs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "escalation_logs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "escalation_rules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "evidence_chain"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "executive_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "executive_reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "feature_flags"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "feedback_entries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "followup_tasks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "followups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "glossary_terms"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "group_members"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "groups"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "guide_catalog"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_attachments"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_certifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_datasets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incident_timeline"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "incidents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "kb_search_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_base"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_graph_edges"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "knowledge_graph_nodes"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "kpi_targets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "leaks"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "letters"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "menus"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "message_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "message_templates_catalog"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "mobile_apps"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "monitoring_jobs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "notifications"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "osint_queries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "page_configs"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "page_descriptors"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pages"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "password_reset_tokens"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "paste_entries"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pdf_report_history"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "personality_scenarios"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "pii_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_analytics"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "platform_users"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "presentation_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "presentations"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "privacy_policy_versions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_audit"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_executions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "report_templates"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "retention_policies"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "saved_filters"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scan_schedules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "schedule_executions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "scheduled_reports"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "seller_profiles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "settings_audit_log"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_requirements"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_scans"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "site_watchers"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "sites"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "smart_alerts"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "system_events"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "system_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "theme_settings"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "threat_actors"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "threat_rules"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "training_documents"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "ui_policies"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_dashboard_widgets"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_roles"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "user_sessions"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "users"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "verification_records"
    },
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp": "visual_alerts"
    }
  ],
  "messages": [],
  "stdout": "Tables_in_HncdBnCn7T8RAKFc6RDhtp\n__drizzle_migrations\nactivity_logs\nadmin_audit_logs\nadmin_feature_flags\nadmin_group_memberships\nadmin_group_permissions\nadmin_groups\nadmin_menu_items\nadmin_menus\nadmin_permissions\nadmin_role_permissions\nadmin_roles\nadmin_theme_settings\nadmin_user_overrides\nadmin_user_roles\nai_chat_messages\nai_chat_sessions\nai_conversations\nai_custom_commands\nai_feedback\nai_messages\nai_ratings\nai_response_ratings\nai_scenarios\nai_search_log\nai_task_state\nai_training_logs\nai_user_sessions\nalert_contacts\nalert_history\napi_keys\napp_scans\napprovals\naudit_log\nbackups\nbatch_scan_jobs\nbreach_sources\nbulk_analysis_jobs\nbulk_analysis_results\ncase_comments\ncase_history\ncases\ncatalogs\nchange_detection_logs\nchannels\nchat_conversations\nchat_history\nchat_messages\ncompliance_alerts\ncompliance_change_notifications\ncompliance_clauses\ncontent_blocks\ncustom_actions\ndark_web_listings\ndashboard_layouts\ndashboard_snapshots\ndata_transfer_logs\ndeep_scan_queue\ndocuments\nemail_notification_prefs\nescalation_logs\nescalation_rules\nevidence_chain\nexecutive_alerts\nexecutive_reports\nfeature_flags\nfeedback_entries\nfollowup_tasks\nfollowups\nglossary_terms\ngroup_members\ngroups\nguide_catalog\nincident_attachments\nincident_certifications\nincident_datasets\nincident_documents\nincident_timeline\nincidents\nkb_search_log\nknowledge_base\nknowledge_graph_edges\nknowledge_graph_nodes\nkpi_targets\nleaks\nletters\nmenus\nmessage_templates\nmessage_templates_catalog\nmobile_apps\nmonitoring_jobs\nnotifications\nosint_queries\npage_configs\npage_descriptors\npages\npassword_reset_tokens\npaste_entries\npdf_report_history\npersonality_scenarios\npii_scans\nplatform_analytics\nplatform_settings\nplatform_users\npresentation_templates\npresentations\nprivacy_policy_versions\nreport_audit\nreport_executions\nreport_templates\nreports\nretention_policies\nroles\nsaved_filters\nscan_schedules\nscans\nschedule_executions\nscheduled_reports\nseller_profiles\nsettings_audit_log\nsite_requirements\nsite_scans\nsite_watchers\nsites\nsmart_alerts\nsystem_events\nsystem_settings\ntheme_settings\nthreat_actors\nthreat_rules\ntraining_documents\nui_policies\nuser_dashboard_widgets\nuser_roles\nuser_sessions\nusers\nverification_records\nvisual_alerts\n",
  "stderr": "",
  "execution_time_ms": 1534
}
```

---

## `.manus/db/db-query-1771363854251.json`

```json
{
  "query": "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('sites', 'scans', 'notifications', 'scheduled_reports') ORDER BY TABLE_NAME;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('sites', 'scans', 'notifications', 'scheduled_reports') ORDER BY TABLE_NAME;",
  "rows": [
    {
      "TABLE_NAME": "notifications"
    },
    {
      "TABLE_NAME": "scans"
    },
    {
      "TABLE_NAME": "scheduled_reports"
    },
    {
      "TABLE_NAME": "sites"
    }
  ],
  "messages": [],
  "stdout": "TABLE_NAME\nnotifications\nscans\nscheduled_reports\nsites\n",
  "stderr": "",
  "execution_time_ms": 1516
}
```

---

## `.manus/db/db-query-1771363877965.json`

```json
{
  "query": "DESCRIBE sites;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute DESCRIBE sites;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "url",
      "Type": "text",
      "Null": "NO",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "workingUrl",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "finalUrl",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "siteNameAr",
      "Type": "varchar(500)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "siteNameEn",
      "Type": "varchar(500)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "title",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "description",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "entityType",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "entityNameAr",
      "Type": "varchar(500)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "entityNameEn",
      "Type": "varchar(500)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "sector",
      "Type": "varchar(200)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "complianceStatus",
      "Type": "enum('compliant','partial','non_compliant','not_working')",
      "Null": "YES",
      "Key": "",
      "Default": "non_compliant",
      "Extra": ""
    },
    {
      "Field": "hasPrivacyPolicy",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "0",
      "Extra": ""
    },
    {
      "Field": "hasContactInfo",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "0",
      "Extra": ""
    },
    {
      "Field": "privacyPolicyUrl",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "phones",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "emails",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "mxRecords",
      "Type": "json",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "cms",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "sslStatus",
      "Type": "varchar(50)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "httpStatus",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "httpsStatus",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "lastScanDate",
      "Type": "timestamp",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "lastChangeDate",
      "Type": "timestamp",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "followupPriority",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "0",
      "Extra": ""
    },
    {
      "Field": "isActive",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "1",
      "Extra": ""
    },
    {
      "Field": "createdBy",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    },
    {
      "Field": "updatedAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nurl\ttext\tNO\t\tNULL\t\nworkingUrl\ttext\tYES\t\tNULL\t\nfinalUrl\ttext\tYES\t\tNULL\t\nsiteNameAr\tvarchar(500)\tYES\t\tNULL\t\nsiteNameEn\tvarchar(500)\tYES\t\tNULL\t\ntitle\ttext\tYES\t\tNULL\t\ndescription\ttext\tYES\t\tNULL\t\nentityType\tvarchar(100)\tYES\t\tNULL\t\nentityNameAr\tvarchar(500)\tYES\t\tNULL\t\nentityNameEn\tvarchar(500)\tYES\t\tNULL\t\nsector\tvarchar(200)\tYES\t\tNULL\t\ncomplianceStatus\tenum('compliant','partial','non_compliant','not_working')\tYES\t\tnon_compliant\t\nhasPrivacyPolicy\ttinyint(1)\tYES\t\t0\t\nhasContactInfo\ttinyint(1)\tYES\t\t0\t\nprivacyPolicyUrl\ttext\tYES\t\tNULL\t\nphones\tjson\tYES\t\tNULL\t\nemails\tjson\tYES\t\tNULL\t\nmxRecords\tjson\tYES\t\tNULL\t\ncms\tvarchar(100)\tYES\t\tNULL\t\nsslStatus\tvarchar(50)\tYES\t\tNULL\t\nhttpStatus\tint(11)\tYES\t\tNULL\t\nhttpsStatus\tint(11)\tYES\t\tNULL\t\nlastScanDate\ttimestamp\tYES\t\tNULL\t\nlastChangeDate\ttimestamp\tYES\t\tNULL\t\nfollowupPriority\tint(11)\tYES\t\t0\t\nisActive\ttinyint(1)\tYES\t\t1\t\ncreatedBy\tint(11)\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\nupdatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\tDEFAULT_GENERATED on update CURRENT_TIMESTAMP\n",
  "stderr": "",
  "execution_time_ms": 1538
}
```

---

## `.manus/db/db-query-1771363887191.json`

```json
{
  "query": "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites' AND COLUMN_NAME IN ('siteStatus', 'site_status', 'sectorType', 'sector_type', 'classification');",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites' AND COLUMN_NAME IN ('siteStatus', 'site_status', 'sectorType', 'sector_type', 'classification');",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 1527
}
```

---

## `.manus/db/db-query-1771363895071.json`

```json
{
  "query": "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites' ORDER BY ORDINAL_POSITION;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites' ORDER BY ORDINAL_POSITION;",
  "rows": [
    {
      "COLUMN_NAME": "id"
    },
    {
      "COLUMN_NAME": "url"
    },
    {
      "COLUMN_NAME": "workingUrl"
    },
    {
      "COLUMN_NAME": "finalUrl"
    },
    {
      "COLUMN_NAME": "siteNameAr"
    },
    {
      "COLUMN_NAME": "siteNameEn"
    },
    {
      "COLUMN_NAME": "title"
    },
    {
      "COLUMN_NAME": "description"
    },
    {
      "COLUMN_NAME": "entityType"
    },
    {
      "COLUMN_NAME": "entityNameAr"
    },
    {
      "COLUMN_NAME": "entityNameEn"
    },
    {
      "COLUMN_NAME": "sector"
    },
    {
      "COLUMN_NAME": "complianceStatus"
    },
    {
      "COLUMN_NAME": "hasPrivacyPolicy"
    },
    {
      "COLUMN_NAME": "hasContactInfo"
    },
    {
      "COLUMN_NAME": "privacyPolicyUrl"
    },
    {
      "COLUMN_NAME": "phones"
    },
    {
      "COLUMN_NAME": "emails"
    },
    {
      "COLUMN_NAME": "mxRecords"
    },
    {
      "COLUMN_NAME": "cms"
    },
    {
      "COLUMN_NAME": "sslStatus"
    },
    {
      "COLUMN_NAME": "httpStatus"
    },
    {
      "COLUMN_NAME": "httpsStatus"
    },
    {
      "COLUMN_NAME": "lastScanDate"
    },
    {
      "COLUMN_NAME": "lastChangeDate"
    },
    {
      "COLUMN_NAME": "followupPriority"
    },
    {
      "COLUMN_NAME": "isActive"
    },
    {
      "COLUMN_NAME": "createdBy"
    },
    {
      "COLUMN_NAME": "createdAt"
    },
    {
      "COLUMN_NAME": "updatedAt"
    }
  ],
  "messages": [],
  "stdout": "COLUMN_NAME\nid\nurl\nworkingUrl\nfinalUrl\nsiteNameAr\nsiteNameEn\ntitle\ndescription\nentityType\nentityNameAr\nentityNameEn\nsector\ncomplianceStatus\nhasPrivacyPolicy\nhasContactInfo\nprivacyPolicyUrl\nphones\nemails\nmxRecords\ncms\nsslStatus\nhttpStatus\nhttpsStatus\nlastScanDate\nlastChangeDate\nfollowupPriority\nisActive\ncreatedBy\ncreatedAt\nupdatedAt\n",
  "stderr": "",
  "execution_time_ms": 1493
}
```

---

## `.manus/db/db-query-1771370516636.json`

```json
{
  "query": "SHOW TABLES LIKE 'notifications';",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute SHOW TABLES LIKE 'notifications';",
  "rows": [
    {
      "Tables_in_HncdBnCn7T8RAKFc6RDhtp (notifications)": "notifications"
    }
  ],
  "messages": [],
  "stdout": "Tables_in_HncdBnCn7T8RAKFc6RDhtp (notifications)\nnotifications\n",
  "stderr": "",
  "execution_time_ms": 1537
}
```

---

## `.manus/db/db-query-1771370522710.json`

```json
{
  "query": "DESCRIBE notifications;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute DESCRIBE notifications;",
  "rows": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": "NULL",
      "Extra": "auto_increment"
    },
    {
      "Field": "userId",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "title",
      "Type": "varchar(500)",
      "Null": "NO",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "message",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "type",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "entityType",
      "Type": "varchar(100)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "entityId",
      "Type": "int(11)",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "isRead",
      "Type": "tinyint(1)",
      "Null": "YES",
      "Key": "",
      "Default": "0",
      "Extra": ""
    },
    {
      "Field": "link",
      "Type": "text",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "readAt",
      "Type": "timestamp",
      "Null": "YES",
      "Key": "",
      "Default": "NULL",
      "Extra": ""
    },
    {
      "Field": "createdAt",
      "Type": "timestamp",
      "Null": "NO",
      "Key": "",
      "Default": "CURRENT_TIMESTAMP",
      "Extra": ""
    }
  ],
  "messages": [],
  "stdout": "Field\tType\tNull\tKey\tDefault\tExtra\nid\tint(11)\tNO\tPRI\tNULL\tauto_increment\nuserId\tint(11)\tNO\t\tNULL\t\ntitle\tvarchar(500)\tNO\t\tNULL\t\nmessage\ttext\tYES\t\tNULL\t\ntype\tvarchar(100)\tYES\t\tNULL\t\nentityType\tvarchar(100)\tYES\t\tNULL\t\nentityId\tint(11)\tYES\t\tNULL\t\nisRead\ttinyint(1)\tYES\t\t0\t\nlink\ttext\tYES\t\tNULL\t\nreadAt\ttimestamp\tYES\t\tNULL\t\ncreatedAt\ttimestamp\tNO\t\tCURRENT_TIMESTAMP\t\n",
  "stderr": "",
  "execution_time_ms": 1567
}
```

---

## `.manus/db/db-query-1771371133892.json`

```json
{
  "query": "CREATE TABLE IF NOT EXISTS `alert_rules` (\n\t`id` int AUTO_INCREMENT NOT NULL,\n\t`ruleName` varchar(255) NOT NULL,\n\t`ruleNameAr` varchar(255),\n\t`conditionType` enum('compliance_drop','new_non_compliant','scan_failure','threshold','custom') NOT NULL,\n\t`conditionValue` json,\n\t`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',\n\t`notifyContacts` json,\n\t`deliveryChannels` json,\n\t`isActive` tinyint NOT NULL DEFAULT 1,\n\t`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n\t`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n\tPRIMARY KEY(`id`)\n);",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute CREATE TABLE IF NOT EXISTS `alert_rules` (\n\t`id` int AUTO_INCREMENT NOT NULL,\n\t`ruleName` varchar(255) NOT NULL,\n\t`ruleNameAr` varchar(255),\n\t`conditionType` enum('compliance_drop','new_non_compliant','scan_failure','threshold','custom') NOT NULL,\n\t`conditionValue` json,\n\t`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',\n\t`notifyContacts` json,\n\t`deliveryChannels` json,\n\t`isActive` tinyint NOT NULL DEFAULT 1,\n\t`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n\t`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n\tPRIMARY KEY(`id`)\n);",
  "rows": [],
  "messages": [],
  "stdout": "",
  "stderr": "",
  "execution_time_ms": 2001
}
```

---

## `.manus/db/db-query-error-1771348753300.json`

```json
{
  "query": "INSERT INTO glossary_terms (term, definition, category) VALUES\n('الامتثال', 'مدى التزام الموقع الإلكتروني بمتطلبات نظام حماية البيانات الشخصية', 'privacy'),\n('سياسة الخصوصية', 'وثيقة قانونية تحدد كيفية جمع واستخدام وحماية البيانات الشخصية', 'privacy'),\n('واقعة تسرب', 'حادثة أمنية تؤدي إلى كشف أو فقدان بيانات شخصية بشكل غير مصرح به', 'incidents'),\n('البيانات الشخصية', 'أي بيانات تتعلق بشخص طبيعي محدد أو يمكن تحديده', 'privacy'),\n('المتابعة', 'إجراء رقابي يتم اتخاذه بعد رصد مخالفة أو واقعة', 'followups'),\n('التقرير', 'وثيقة رسمية تلخص نتائج الرصد والتحليل', 'reports'),\n('الجهة المشرفة', 'الجهة الحكومية المسؤولة عن الرقابة على حماية البيانات الشخصية', 'general'),\n('فئة البيانات', 'تصنيف نوع البيانات الشخصية المتسربة مثل بيانات مالية أو صحية', 'incidents'),\n('مستوى الحساسية', 'درجة خطورة البيانات المتسربة: منخفض، متوسط، عالٍ، حرج', 'incidents'),\n('الأثر', 'مقياس تأثير واقعة التسرب على الأفراد والجهات المتضررة', 'incidents');",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO glossary_terms (term, definition, category) VALUES\n('الامتثال', 'مدى التزام الموقع الإلكتروني بمتطلبات نظام حماية البيانات الشخصية', 'privacy'),\n('سياسة الخصوصية', 'وثيقة قانونية تحدد كيفية جمع واستخدام وحماية البيانات الشخصية', 'privacy'),\n('واقعة تسرب', 'حادثة أمنية تؤدي إلى كشف أو فقدان بيانات شخصية بشكل غير مصرح به', 'incidents'),\n('البيانات الشخصية', 'أي بيانات تتعلق بشخص طبيعي محدد أو يمكن تحديده', 'privacy'),\n('المتابعة', 'إجراء رقابي يتم اتخاذه بعد رصد مخالفة أو واقعة', 'followups'),\n('التقرير', 'وثيقة رسمية تلخص نتائج الرصد والتحليل', 'reports'),\n('الجهة المشرفة', 'الجهة الحكومية المسؤولة عن الرقابة على حماية البيانات الشخصية', 'general'),\n('فئة البيانات', 'تصنيف نوع البيانات الشخصية المتسربة مثل بيانات مالية أو صحية', 'incidents'),\n('مستوى الحساسية', 'درجة خطورة البيانات المتسربة: منخفض، متوسط، عالٍ، حرج', 'incidents'),\n('الأثر', 'مقياس تأثير واقعة التسرب على الأفراد والجهات المتضررة', 'incidents');",
  "returncode": 1,
  "logs": [
    "ERROR 1054 (42S22) at line 1: Unknown column 'category' in 'field list'"
  ]
}
```

---

## `.manus/db/db-query-error-1771348789428.json`

```json
{
  "query": "INSERT INTO page_descriptors (pageSlug, titleAr, descriptionAr, contextHints) VALUES\n('/app/overview', 'لوحة المؤشرات العامة', 'الصفحة الرئيسية للمنصة تعرض ملخص شامل لحالة الامتثال والوقائع والمتابعات', '[\"إجمالي المواقع\",\"نسبة الامتثال\",\"عدد الوقائع\",\"المتابعات المفتوحة\"]'),\n('/app/privacy', 'لوحة الخصوصية', 'لوحة تفصيلية لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية', '[\"توزيع الامتثال\",\"المواقع بدون سياسة\",\"المواقع بدون تواصل\",\"التغييرات الجوهرية\"]'),\n('/app/privacy/sites', 'قائمة المواقع', 'جدول شامل لجميع المواقع المرصودة مع حالة الامتثال والتفاصيل', '[\"فلترة حسب الحالة\",\"بحث بالاسم\",\"تصدير البيانات\"]'),\n('/app/incidents', 'لوحة التسربات', 'لوحة تفصيلية لمتابعة وقائع تسرب البيانات الشخصية', '[\"توزيع الوقائع حسب الحالة\",\"فئات البيانات\",\"مستوى الأثر\",\"الجهات المتضررة\"]'),\n('/app/incidents/list', 'قائمة الوقائع', 'جدول شامل لجميع وقائع تسرب البيانات مع التفاصيل والحالة', '[\"فلترة حسب الحالة\",\"بحث بالرقم\",\"تصدير البيانات\"]'),\n('/app/followups', 'المتابعات', 'قائمة المتابعات والإجراءات الرقابية المتخذة', '[\"المتابعات المفتوحة\",\"المتأخرة\",\"قيد التنفيذ\",\"المكتملة\"]'),\n('/app/reports', 'التقارير', 'إنشاء وإدارة التقارير الرسمية والدورية', '[\"إنشاء تقرير\",\"القوالب\",\"التقارير المجدولة\",\"الأرشيف\"]'),\n('/app/my', 'لوحتي المخصصة', 'لوحة مؤشرات قابلة للتخصيص حسب احتياجات المستخدم', '[\"إضافة ويدجت\",\"تخصيص الفلاتر\",\"حفظ التخطيط\"]'),\n('/app/smart-rasid', 'راصد الذكي', 'المساعد التشغيلي الذكي للمنصة', '[\"محادثة\",\"تحليل بيانات\",\"إنشاء تقارير\",\"كتابة رسائل رسمية\"]');",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO page_descriptors (pageSlug, titleAr, descriptionAr, contextHints) VALUES\n('/app/overview', 'لوحة المؤشرات العامة', 'الصفحة الرئيسية للمنصة تعرض ملخص شامل لحالة الامتثال والوقائع والمتابعات', '[\"إجمالي المواقع\",\"نسبة الامتثال\",\"عدد الوقائع\",\"المتابعات المفتوحة\"]'),\n('/app/privacy', 'لوحة الخصوصية', 'لوحة تفصيلية لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية', '[\"توزيع الامتثال\",\"المواقع بدون سياسة\",\"المواقع بدون تواصل\",\"التغييرات الجوهرية\"]'),\n('/app/privacy/sites', 'قائمة المواقع', 'جدول شامل لجميع المواقع المرصودة مع حالة الامتثال والتفاصيل', '[\"فلترة حسب الحالة\",\"بحث بالاسم\",\"تصدير البيانات\"]'),\n('/app/incidents', 'لوحة التسربات', 'لوحة تفصيلية لمتابعة وقائع تسرب البيانات الشخصية', '[\"توزيع الوقائع حسب الحالة\",\"فئات البيانات\",\"مستوى الأثر\",\"الجهات المتضررة\"]'),\n('/app/incidents/list', 'قائمة الوقائع', 'جدول شامل لجميع وقائع تسرب البيانات مع التفاصيل والحالة', '[\"فلترة حسب الحالة\",\"بحث بالرقم\",\"تصدير البيانات\"]'),\n('/app/followups', 'المتابعات', 'قائمة المتابعات والإجراءات الرقابية المتخذة', '[\"المتابعات المفتوحة\",\"المتأخرة\",\"قيد التنفيذ\",\"المكتملة\"]'),\n('/app/reports', 'التقارير', 'إنشاء وإدارة التقارير الرسمية والدورية', '[\"إنشاء تقرير\",\"القوالب\",\"التقارير المجدولة\",\"الأرشيف\"]'),\n('/app/my', 'لوحتي المخصصة', 'لوحة مؤشرات قابلة للتخصيص حسب احتياجات المستخدم', '[\"إضافة ويدجت\",\"تخصيص الفلاتر\",\"حفظ التخطيط\"]'),\n('/app/smart-rasid', 'راصد الذكي', 'المساعد التشغيلي الذكي للمنصة', '[\"محادثة\",\"تحليل بيانات\",\"إنشاء تقارير\",\"كتابة رسائل رسمية\"]');",
  "returncode": 1,
  "logs": [
    "ERROR 1054 (42S22) at line 1: Unknown column 'titleAr' in 'field list'"
  ]
}
```

---

## `.manus/db/db-query-error-1771354721417.json`

```json
{
  "query": "INSERT INTO platform_settings (settingKey, settingValue, settingType, category, label, labelEn, description, isEditable, sortOrder) VALUES\n('platform_name', 'منصة راصد الذكية', 'text', 'general', 'اسم المنصة', 'Platform Name', 'اسم المنصة الرئيسي', 1, 1),\n('platform_name_en', 'Smart Rasid Platform', 'text', 'general', 'اسم المنصة بالإنجليزية', 'Platform Name EN', 'English platform name', 1, 2),\n('organization_name', 'مكتب إدارة البيانات الوطنية', 'text', 'general', 'اسم الجهة', 'Organization Name', 'اسم الجهة المالكة', 1, 3),\n('default_theme', 'dark', 'select', 'appearance', 'السمة الافتراضية', 'Default Theme', 'السمة الافتراضية للمنصة', 1, 10),\n('maintenance_mode', 'false', 'boolean', 'system', 'وضع الصيانة', 'Maintenance Mode', 'تفعيل وضع الصيانة', 1, 20);",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute INSERT INTO platform_settings (settingKey, settingValue, settingType, category, label, labelEn, description, isEditable, sortOrder) VALUES\n('platform_name', 'منصة راصد الذكية', 'text', 'general', 'اسم المنصة', 'Platform Name', 'اسم المنصة الرئيسي', 1, 1),\n('platform_name_en', 'Smart Rasid Platform', 'text', 'general', 'اسم المنصة بالإنجليزية', 'Platform Name EN', 'English platform name', 1, 2),\n('organization_name', 'مكتب إدارة البيانات الوطنية', 'text', 'general', 'اسم الجهة', 'Organization Name', 'اسم الجهة المالكة', 1, 3),\n('default_theme', 'dark', 'select', 'appearance', 'السمة الافتراضية', 'Default Theme', 'السمة الافتراضية للمنصة', 1, 10),\n('maintenance_mode', 'false', 'boolean', 'system', 'وضع الصيانة', 'Maintenance Mode', 'تفعيل وضع الصيانة', 1, 20);",
  "returncode": 1,
  "logs": [
    "ERROR 1054 (42S22) at line 1: Unknown column 'label' in 'field list'"
  ]
}
```

---

## `.manus/db/db-query-error-1771371100290.json`

```json
{
  "query": "DESCRIBE alert_rules;",
  "command": "mysql --batch --raw --column-names --default-character-set=utf8mb4 --host gateway02.us-east-1.prod.aws.tidbcloud.com --port 4000 --user ndEWEi7NTAqVxkH.88bfec644707 --database HncdBnCn7T8RAKFc6RDhtp --execute DESCRIBE alert_rules;",
  "returncode": 1,
  "logs": [
    "ERROR 1146 (42S02) at line 1: Table 'hncdbncn7t8rakfc6rdhtp.alert_rules' doesn't exist"
  ]
}
```

---

