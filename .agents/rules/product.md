# Visiblo Product & UX Rules

This document establishes binding product and user experience rules for Visiblo Smart Field Work SaaS.

---

## 1. Zero Layout Shift on Board/List Drag-and-Drop & Background Reloads (STRICT BINDING RULE)

- **Problem Description**:
  When a user moves or switches a card (e.g. Sales Pipeline Kanban boards, sales cards, opportunity stages, task boards, or lead statuses), unmounting the board or replacing it with an inline loading spinner collapses the board's height. This causes all lower UI sections (such as bottom analytics cards, "Top Active Deal" spotlight, KPI widgets, and charts) to jump/shoot to the top of the screen for a split second before snapping back down. This creates an amateur, jarring, and disruptive user experience.

- **Mandatory Requirements**:
  1. **Optimistic UI Updates**:
     - Whenever a user drags and drops or switches a card/stage, update local state immediately (0ms delay) so the card moves to the destination column and badge counts update instantly without any visual jitter.
     - If the backend mutation fails, gracefully revert the local state and display a floating toast error.
  2. **In-Place Background Synchronization**:
     - Only display a full container loading skeleton on initial page load when no cached or previous data exists (`loading && !data`).
     - During background query reloads (`reload()`) or mutation lifecycle updates, the board MUST remain fully mounted and visible in-place.
     - Never replace active boards with a small spinner during data refetches.
  3. **Stable Minimum Height Bounds**:
     - Enforce a fixed minimum height (`min-h-[460px]`) on the board container so layout bounds remain rock-solid regardless of card counts.
  4. **Non-Disruptive Refresh Indicators**:
     - If visual feedback for background activity is needed, render a subtle spinning refresh icon in the section header that introduces zero layout shift.

---

## 2. Master UI/UX & Design System References

For comprehensive input component standards, executive dropdown avatars, and layout rules, refer to [VISIBLO_DESIGN_SYSTEM.md](file:///c:/Users/MY%20PC/OneDrive/Desktop/Smart-Field-Work-Saas/.agents/rules/VISIBLO_DESIGN_SYSTEM.md).
