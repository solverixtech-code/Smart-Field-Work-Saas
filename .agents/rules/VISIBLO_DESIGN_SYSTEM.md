---
trigger: always_on
---

# Visiblo Smart Field Work — Master UI/UX & Code Standards

This document establishes the binding design system, component standards, typography rules, and UX patterns for all frontend screens in the **Visiblo Smart Field Work** SaaS platform.

---

## 1. Input Fields & Data Entry Rules

1. **Phone & Numeric Inputs**:
   - Never use raw generic text inputs for numbers or contact numbers.
   - Use `type="tel"` with `+91` prefix mask for Indian phone numbers (e.g. `+91 96540 88990`).
   - Use `type="number"` for numeric amounts, quantities, and durations.

2. **Searchable Executive Dropdowns & Profile Avatars (STRICT BINDING RULE)**:
   - Every single dropdown or selector that pulls, assigns, or selects an Employee, Field Executive, Manager, Team Leader, or Business MUST have a **Searchable Input** (`searchable={true}`).
   - Dropdown item options for Employees/Executives MUST render the person's **Profile Picture / Avatar Image (`avatar: "https://..."`)**, Full Name (`label`), and Role/Zone (`sublabel`).
   - Plain text-only employee select dropdowns are strictly prohibited across all screens and modals.

3. **Auto-Populating Business Details**:
   - When selecting a Business/Lead in any Modal or Form, automatically populate and display a **Selected Business Summary Card** showing Business Name, Type, Address, Contact Person, Designation, and Mobile Number.
   - Do NOT render redundant manual text inputs for contact details when a business is already selected.

4. **Date & Time Picker Components**:
   - **Date Pickers**: Always use the reusable `<DatePicker />` component with an interactive month/year calendar popup.
   - **Time Pickers**: Always use an interactive clock time picker modal for scheduling time slots.

5. **Reusable Custom Checkbox Component (STRICT BINDING RULE)**:
   - Never render raw HTML `<input type="checkbox" />` elements.
   - Always use the pre-built, styled `<Checkbox checked={...} onChange={...} label={...} />` component from `src/components/ui/Checkbox.tsx` for consistent enterprise UI styling across all forms, tables, and modals.

---

## 2. Typography & Color Tokens

1. **No Grey Bold Uppercase Labels (STRICT BINDING RULE)**:
   - Strictly avoid washed-out grey bold uppercase text anywhere on the platform (e.g. NEVER use `text-slate-400 font-bold UPPERCASE` for field labels or table header column titles).
   - Table headers must ALWAYS use clean Title Case (e.g. `Lead Details`, `Source`, `Campaign / Form`, `Time Captured`, `Status`, `Assigned To`, `Actions`) with crisp enterprise contrast (`text-xs font-extrabold text-[#0D1F3D]` or `text-xs font-bold text-slate-700`).
   - Use crisp, high-contrast, professional enterprise typography:
     - **Field Labels**: `text-xs font-semibold text-slate-500`
     - **Headings & Table Headers**: `text-[#0D1F3D] font-extrabold`
     - **Secondary Info**: `text-xs text-slate-600 font-medium`
     - **Mono Codes (IDs, Phones, Coordinates)**: `font-mono text-slate-800 font-bold`

2. **Proper Title Case Capitalization**:
   - Always use standard Title Case for headers, table column headers, and actions (e.g. `Add Follow-up`, `Completed Demos`, `Executive Details`, `Lead Details`).
   - Never use wide tracking or exaggerated letter spacing on standard labels.

---

## 3. Data Tables & Page Layouts

1. **100% Full-Width Data Tables**:
   - Main data tables must always occupy 100% full width (`w-full`).
   - Apply `whitespace-nowrap` and minimum widths to table header/cell elements so columns never line-wrap or squeeze awkwardly.

2. **Bottom Analytics Cards Positioning**:
   - Analytics widgets, donut charts, and summary KPI cards must be placed on the bottom row below data tables (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2`) to keep table width unconstrained.

---

## 4. Interactive Action Menus & Modals

1. **Table Row Actions Three Dots (`...`)**:
   - Clicking three dots (`...`) in any table row must trigger an interactive floating `<RowActionsMenu />` popover overlay.
   - Include options: `View Details`, `Edit Item`, `Mark Completed`, `Reschedule`, and `Delete`.

2. **Header Action Buttons**:
   - Clicking `Actions ∨` or `More Actions ∨` in detail pages must toggle a floating popover menu with contextual actions.
   - Clicking `Edit` must open a pre-populated `<EditModal />` allowing instant editing.

3. **Smooth Enterprise Modal Animations**:
   - All modals must be rendered via portals with smooth two-stage backdrop blur & scale-up transitions (`scale-95 opacity-0` ➔ `scale-100 opacity-100`).

4. **Fixed Layout Bounds, Height Consistency & Zero Layout Shift (STRICT BINDING RULE)**:
   - Layout shift, UI jitter, and vertical card/container expansion upon form validation errors are strictly undesirable and prohibited across all forms, cards, login containers, and modals.
   - Modals and login cards must NEVER shift, jump, or change height by even a single pixel when displaying error alerts, switching sub-tabs, target types, radio options, or conditional input fields.
   - Set fixed container height bounds (`min-h-[560px] flex flex-col justify-between`) and enforce fixed trigger/input heights (`h-10 min-h-[40px]`) so frames remain 100% rock-solid, fixed, and pixel-stable.
   - **Error Handling (Floating Toast Only)**: Always rely on floating Toast Notifications (e.g. `toast.error(...)`) for error alerts. Never inject dynamic inline error banner blocks that stretch container height or push down surrounding inputs/buttons. Use subtle input border highlighting (`border-rose-400 bg-rose-50/20`) for field-level feedback.

5. **Zero Layout Shift on Board/List Drag-and-Drop & Background Reloads (STRICT BINDING RULE)**:
   - When moving cards, switching stages (e.g. Sales Pipeline Kanban boards, sales cards, task boards, or lead statuses), NEVER unmount the board or replace the board with a small loading indicator/spinner during mutations or background reloads.
   - Unmounting the board causes lower components (such as bottom analytics cards, "Top Active Deal", KPI summaries, charts) to shoot abruptly to the top of the viewport for a split second before snapping back down, creating an amateur, jarring, and broken user experience.
   - **Optimistic UI Updates**: Card position, column stage, and stage count badges MUST update immediately on drop in local state (0ms delay).
   - **In-Place Background Sync**: Only render a full container loading skeleton on initial page mount when no cached/previous data exists (`loading && !data`). During background mutations and query reloads (`reload()`), the board must remain fully mounted and stable in-place with fixed minimum container height (`min-h-[460px]`), displaying at most a subtle, non-disruptive inline refresh spinner in the section header that introduces zero layout shift.

---

## 5. Sidebar Navigation & Active States

1. **Exact Sub-Route Matching**:
   - Sidebar active state logic (`isActive` in `AppShell.tsx`) must strictly distinguish exact match sub-routes (`/admin/demos/today`, `/admin/demos/scheduled`, `/admin/follow-ups/today`, etc.) so root items like "All Demos" or "All Follow-ups" do not stay highlighted simultaneously.

2. **Breadcrumb Hierarchy**:
   - Every page must feature a clean breadcrumb navigation header (e.g. `Dashboard > Follow-up Management > Today's Follow-ups`).

---

## 6. Layout, Role Screens & Reusable Admin Components (STRICT BINDING RULE)

1. **Reusing Admin Dashboard Architecture**:
   - Whenever creating screens, layouts, or navigation for a new role (e.g. Platform Super Admin, SaaS Console, Operations, Onboarding, Support, Billing, Auditor), NEVER build custom or alternative UI/UX layouts, custom headers, custom notification icons, or one-off stat card designs.
   - The UI, UX, Sidebar, Header, Notification Bell, User Avatar Dropdown, Breadcrumbs, Stat Cards (`<KpiCard />`), Date Pickers, and Footers MUST strictly refer to and reuse the exact components and architecture established in the Admin Dashboard (`AppShell.tsx` & `src/components/dashboard/KpiCard.tsx`).

2. **Unified Component Reuse Standards**:
   - **Sidebar**: White enterprise theme (`bg-white border-r border-slate-200 shadow-xs`), active pill (`bg-[#0D1F3D] text-white shadow-xs font-semibold`), collapsible behavior, and bottom left user card drawer.
   - **Header Bar**: Fixed height `h-20` white header bar with breadcrumb navigation (`Home > Category > Page`), search input, notification bell button with red indicator dot (`<Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E20613]" />`), and top-right header user profile card with role label dropdown.
   - **Stat Cards**: Must ALWAYS use the pre-built `<KpiCard title={...} value={...} icon={...} iconBgColor={...} iconTextColor={...} />` component.
   - **Background Container**: Use `<main className="flex-1 overflow-y-auto bg-[#F3F5F7]"><div className="mx-auto w-full max-w-[1720px] p-6 lg:p-8 space-y-6 font-sans">`.

3. **Constant Account Navigation & Profile Drawer Across All Roles**:
   - The `Account` category (`My Profile`, `Security & 2FA`, `Active Sessions`) and the bottom user profile card drawer MUST ALWAYS be present in the sidebar for EVERY role without exception.
