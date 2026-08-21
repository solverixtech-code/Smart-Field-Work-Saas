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

1. **No Grey Bold Uppercase Labels**:
   - Strictly avoid washed-out grey bold uppercase labels (e.g. do NOT use `text-slate-400 font-bold UPPERCASE`).
   - Use crisp, high-contrast, professional enterprise typography:
     - **Field Labels**: `text-xs font-semibold text-slate-500`
     - **Headings & Primary Text**: `text-[#0D1F3D] font-extrabold`
     - **Secondary Info**: `text-xs text-slate-600 font-medium`
     - **Mono Codes (IDs, Phones, Coordinates)**: `font-mono text-slate-800 font-bold`

2. **Proper Title Case Capitalization**:
   - Always use standard Title Case for headers and actions (e.g. `Add Follow-up`, `Completed Demos`, `Executive Details`).
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

4. **Fixed Layout Bounds & Height Consistency (STRICT BINDING RULE)**:
   - Modals must NEVER shift, jump, or change height by even a single pixel when switching sub-tabs, target types, radio options, or conditional input fields (e.g. switching between Team Target and Individual Executive).
   - Set fixed container height bounds (`min-h-[560px] flex flex-col justify-between`) and enforce fixed dropdown trigger height (`h-10 min-h-[40px]`) so the modal frame remains 100% rock-solid, fixed, and pixel-stable.

---

## 5. Sidebar Navigation & Active States

1. **Exact Sub-Route Matching**:
   - Sidebar active state logic (`isActive` in `AppShell.tsx`) must strictly distinguish exact match sub-routes (`/admin/demos/today`, `/admin/demos/scheduled`, `/admin/follow-ups/today`, etc.) so root items like "All Demos" or "All Follow-ups" do not stay highlighted simultaneously.

2. **Breadcrumb Hierarchy**:
   - Every page must feature a clean breadcrumb navigation header (e.g. `Dashboard > Follow-up Management > Today's Follow-ups`).
