# Project TODO - Rasid National Platform

## Phase 1: Database & Backend
- [x] Create merged database schema (42 tables from both platforms)
- [x] Create database helper functions (db.ts)
- [x] Create tRPC routers with all procedures
- [x] Push database migrations
- [x] Seed user accounts (4 admin/superadmin users)
- [x] Seed glossary terms (10 terms)
- [x] Seed page descriptors (9 pages)

## Phase 2: Theme & Layout
- [x] Set up dark theme (Quantum Leap Navy/Gold)
- [x] Configure RTL + Tajawal font
- [x] Build AppLayout with 7 workspaces sidebar
- [x] Upload and integrate brand assets (logos + characters)
- [x] Custom scrollbar, glass-card, stat-card utilities
- [x] Page background with radial gradients

## Phase 3: Main Dashboards
- [x] Overview Dashboard (combined privacy + incidents + followups)
- [x] Privacy Compliance Dashboard with drill-down
- [x] Incidents Dashboard with drill-down
- [x] My Dashboard (customizable layout)

## Phase 4: Detail Pages
- [x] Privacy Sites list page
- [x] Privacy Site detail page with tabs
- [x] Incidents list page
- [x] Incident detail page with tabs
- [x] Follow-ups list page
- [x] Reports list page

## Phase 5: Admin Panel
- [x] Users management page
- [x] Platform settings page

## Phase 6: Smart Rasid AI
- [x] AI chat full page (/app/smart-rasid)
- [x] Floating AI assistant (FAB) on all pages
- [x] Context-aware suggestions per route
- [x] LLM integration with platform data
- [x] Conversation history management
- [x] Page context awareness
- [x] Professional Arabic language responses

## Phase 7: Supporting Features
- [x] QR verification system (public page)
- [x] Notifications system (unread count + list)
- [x] Public landing page with brand assets

## Phase 8: Testing & Polish
- [x] Write Vitest tests (20 tests passing)
- [x] Verify all routes work
- [x] Check RTL consistency
- [x] 0 TypeScript errors
- [x] Save checkpoint

## Phase 9 - ACTUAL MERGE from Existing Platforms (Priority)
- [x] Copy schema.ts from Platform 1 (1108 lines - the complete one)
- [x] Merge unique tables from Platform 2 schema into merged schema (39 unique tables added, total 1710 lines)
- [x] Copy db.ts from Platform 1 (5843 lines) and merge Platform 2 db.ts (94 unique functions added, total 6868 lines)
- [x] Copy routers.ts from Platform 1 (7431 lines) and merge Platform 2 routers.ts (25 unique routers added, total 8749 lines)
- [ ] Copy all 69 pages from Platform 1
- [ ] Copy unique pages from Platform 2 (52 pages, merge non-duplicates)
- [ ] Copy all 30+ components from Platform 1
- [ ] Copy unique components from Platform 2
- [ ] Copy index.css theme from Platform 1 (royal blue dark theme)
- [ ] Copy App.tsx routes and navigation from Platform 1
- [ ] Merge Platform 2 unique routes into App.tsx
- [ ] Fix all imports and paths after merge
- [ ] Apply local auth system (already exists in both platforms)
- [ ] Verify royal blue background (not black)
- [ ] Use Rasid character for Smart AI icon
- [ ] Professional logo animation
- [ ] Article 12 compliance with 8 clauses evaluation
- [ ] Dashboard with dual indicator groups (general + 8 clauses)
- [ ] Import 24,983 Saudi domains from CSV
- [ ] Verify all features work end-to-end
- [ ] Write/update tests
- [ ] Save checkpoint

## Phase 10 - Apply Platform 2 Design (User Request)
- [ ] Review Platform 2 CSS theme and design (the correct design)
- [ ] Copy Platform 2 index.css theme to merged platform
- [ ] Apply Platform 2 design patterns to layout/navigation
- [ ] Fix all build errors (missing packages, imports)
- [ ] Save checkpoint with working build

## Phase 11 - GitHub & Auth Fix
- [x] Create private GitHub repo (raneemndmo-collab/rasid-national-platform)
- [x] Push all code to GitHub
- [x] Fix getLoginUrl to redirect to /login (local) instead of Manus OAuth
- [x] Fix AppLayout.tsx OAuth redirect to use /login
- [ ] Save checkpoint with working build
