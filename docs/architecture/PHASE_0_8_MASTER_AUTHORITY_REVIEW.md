# Phase 0.8 Master authority review

Status: **PREREQUISITE REVIEW COMPLETE; SEED CONTRACT REVISION 1 OWNER APPROVED. IMPLEMENTATION IN PROGRESS.**

Continuation on 2026-09-07: the owner explicitly approved `PHASE_0_8_MASTER_SEED_CONTRACT.md` revision 1. That approved contract resolves the seed-content/policy stop below with 24 definitions, 44 production System values, nine empty System categories, 13 demo-only candidates and six deferred Module bindings. The rest of this document is the historical pre-approval audit, not the current implementation/release status. No production rows have been seeded or reconciled.

Audit date: 2026-09-07. Repository: `solverixtech-code/Smart-Field-Work-Saas`.
Checkout: `C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas`.
Approved baseline and current HEAD: `8709198fecd4e180b21358138eb5708d509c106d`.
Branch: `feat/phase-0.8-master-engine`. No application changes, seeds, migrations, production queries, commit, push or PR were made in this pass. The unrelated Truroot checkout was not modified.

## Authority and source snapshot

The current Phase 0.8 instruction freezes 0.1–0.7 and authorizes the Master Engine only. Its explicit STOP conditions include Generic fixtures containing formulas/rates/workflow semantics and ambiguous approved system values. The later instruction to continue work did not specify replacement seed meanings or waive those conditions.

The eight governing documents were reviewed: `PHASE_0_EXECUTION_PLAN.md`, `PHASE_0_MASTER_CLASSIFICATION.md`, `PHASE_0_BACKEND_CONVERSION_MATRIX.md`, `PHASE_0_ENTITY_OWNERSHIP_MATRIX.md`, `PHASE_0_ARCHITECTURE_DECISIONS.md`, `PHASE_0_RISK_REGISTER.md`, `PHASE_0_7_INDUSTRY_TEMPLATES_IMPLEMENTATION.md`, and `PHASE_0_7_INDUSTRY_FIXTURE_REVIEW.md`. Historical reports describe earlier baselines; current source and the latest approved instruction control this pass. In particular, the 0.7 report still says NOT FROZEN, while the user explicitly supplies the frozen merged baseline above. This is stale tracking text, not authorization to reopen 0.7 behavior.

Fixture source throughout this review: `apps/web/src/screens/admin/masters/systemMastersData.ts` (abbreviated **F** in the table). The immutable Git blob at the approved SHA is the snapshot; no duplicate fixture file or runtime import was created.

| Evidence | Result |
| --- | --- |
| SHA-256 of fixture Git blob at approved HEAD | `831fb902b1231329dbb072c0b1de8e5a988865acf5ddc93d2b74a65c4421c80b` |
| SHA-256 of local fixture bytes | `bd9edb2012550f507dae1816b1e88d108ec4d2e57976f8e68b76131e70fa5de4` |
| SHA-256 of classification Git blob at approved HEAD | `142b8875ffc51d82f60a9cf6158c98784320cf22ebc488f7e9f1781819fff6de` |
| Category configurations / record-category keys / classification rows | 44 / 44 / 44 |
| A / B / C / D / F | 24 / 8 / 10 / 1 / 1 |
| B + D / unclassified | 9 / 0 |
| Total fixture value rows | 153 |
| A-class rows inspected | 86 |
| A-class `isSystemDefault: true` / `false` | 75 / 11 |
| Non-Generic rows excluded from any Generic seed | 67 |
| Missing category matches / duplicate codes within a category | 0 / 0 |
| Approved production system-value count | **UNRESOLVED**; neither 75 nor 86 is inferred as approval |

Git uses LF while this checkout uses CRLF; hashes deliberately identify both byte representations. Source inventory used the existing TypeScript parser to read literal category/record declarations without executing the frontend. Counts were independently recomputed from category rows and fixture record lines. Classification identities and counts match the approved list; classification was not changed.

## Complete 44-category authority inventory

Groups: **HR** = HR & Personnel; **Sales** = Sales & Pipeline; **Demos** = Demos & Follow-ups; **Field** = Operations & Field; **Business** = Business & Merchants; **Payroll** = Payroll & Subscriptions. Display names below are the actual fixture category names.

Tenant/Industry columns describe intended ownership and whether the reviewed classification permits industry defaults, not existing runtime support. All A-class targets are the proposed `MasterDefinition` / `MasterValue` / `MasterValueOverride` engine, absent at this baseline. All current Master-page entries are local fixture state, including entries with an existing domain authority. **HOLD** means reviewed candidate only, no approved production import. **EXCLUDE** means never seed as Generic. B/C owning-domain work has no authorized implementation phase number here; it remains later domain work, with UI conversion in 0.11. Existing Team/Shift persistence is not evidence that the Master page uses it.

| Code | Display name / group | Class | Generic? | Tenant? | Industry defaults? | Target authority | Module binding or unresolved dependency | Fixture source / rows | Seed disposition | Current availability / deferred owner / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| designation | Designations / HR | A | YES | YES | YES | Master engine: designation | NULL; attendance/workforce core ambiguous | F:572 / 4 | HOLD | Fixture only; 0.8 engine, 0.11 UI; not a role grant |
| team | Departments & Teams / HR | B | NO | YES | NO | Team | Unresolved core workforce | F:578 / 4 | EXCLUDE | Team model exists; geographic demo rows need explicit domain mapping |
| contact_role | Merchant Contact Roles / HR | A | YES | YES | YES | Master engine: contact role | core_crm | F:584 / 4 | HOLD | Fixture only; 0.8 engine, 0.11 UI |
| leave_type | Leave & Absence Types / HR | A | YES | YES | YES | Master engine: leave label | attendance | F:590 / 4 | HOLD | Accrual, paid entitlement and approval remain leave policies |
| followup_type | Follow-up Types / Demos | A | YES | YES | YES | Master engine: follow-up type | core_crm | F:694 / 4 | HOLD | Fixture only; no follow-up workflow implemented here |
| followup_outcome | Follow-up Outcomes / Demos | A | YES | YES | YES | Master engine: outcome label | core_crm | F:700 / 4 | HOLD | NOT_REACHABLE embeds a three-attempt threshold |
| demo_type | Demo Delivery Modes / Demos | A | YES | YES | YES | Master engine: demo mode | demo_scheduler | F:706 / 3 | HOLD | Fixture only; scheduling remains domain-owned |
| gps_exception_type | GPS Violations & Exceptions / Field | C | NO | YES | YES, future policy | GPS exception policy | field_visits | F:711 / 4 | EXCLUDE | Detection thresholds and emitted states; future GPS domain |
| transport_mode | Transport Modes & Allowance / Field | C | NO | YES | YES, future policy | TransportMode plus ReimbursementPolicy | Unresolved payroll/expenses | F:717 / 3 | EXCLUDE | Currency/km labels require a future policy split |
| task_activity_type | Task & Activity Heads / Field | A | YES | YES | YES | Master engine: activity label | core_crm | F:722 / 3 | HOLD | Labels do not execute visits or messaging |
| lead_stage | Lead Stages & Pipeline / Sales | B | NO | YES | YES, future domain | PipelineDefinition / PipelineStage | core_crm | F:598 / 5 | EXCLUDE | Target models absent; future ordered pipeline and terminal states |
| lead_source | Lead Sources / Sales | A | YES | YES | YES | Master engine: lead source | core_crm | F:605 / 4 | HOLD | Two rows marked custom; test-only INBOUND/FIELD_PROSPECTING not fixture codes |
| lost_reason | Lost Deal Reasons / Sales | A | YES | YES | YES | Master engine: lost reason | core_crm | F:611 / 4 | HOLD | FEATURE_GAP marked custom; SaaS-specific description needs review |
| lead_rating | Lead Ratings & Intent / Sales | C | NO | YES | YES, future policy | Rating/scoring policy | core_crm | F:617 / 3 | EXCLUDE | Intent thresholds; future CRM scoring |
| territory | Territories & Zones / Field | B | NO | YES | POSSIBLE, not approved | Territory / boundaries / assignments | Unresolved core_crm/field_visits | F:624 / 3 | EXCLUDE | Target model absent; location fixtures not global defaults |
| visit_type | Field Visit Types / Field | A | YES | YES | YES | Master engine: visit label | field_visits | F:629 / 4 | HOLD | AI/store-specific description; ONBOARDING marked custom |
| visit_reason | Visit Cancellation Reasons / Field | A | YES | YES | YES | Master engine: cancellation label | field_visits | F:635 / 4 | HOLD | WEATHER/STORE_CLOSED marked custom |
| expense_category | Expense Categories / Field | A | YES | YES | YES | Master engine: expense label | NULL; expenses/payroll unresolved | F:641 / 3 | HOLD | TOLL_PARKING marked custom; rates remain policy |
| business_type | Business Categories / Business | A | YES | YES | YES | Master engine: account category | core_crm | F:648 / 5 | HOLD | Sector labels require production-default review; not Tenant Industry assignment |
| business_scale | Business Revenue Slabs / Business | C | NO | YES | YES, future policy | Effective-dated classification policy | core_crm | F:655 / 4 | EXCLUDE | Turnover thresholds are not editable lookup meanings |
| market_hub | Commercial Markets & Hubs / Business | B | NO | YES | POSSIBLE, not approved | MarketHub / geography | Unresolved core_crm/field_visits | F:661 / 4 | EXCLUDE | Target model absent; location-specific demo rows |
| incentive_type | Incentive Types / Payroll | A | YES | YES | YES | Master engine: incentive head | payroll | F:669 / 4 | HOLD | Percentage/threshold/flat bonus semantics must stay outside Generic storage |
| allowance_type | Allowance Types / Payroll | A | YES | YES | YES | Master engine: allowance head | payroll | F:675 / 4 | HOLD | Monthly/per-km calculation descriptions need explicit neutralization |
| deduction_type | Deduction Types / Payroll | A | YES | YES | YES | Master engine: deduction head | payroll | F:681 / 4 | HOLD | Statutory/tax-slab/pro-rata rules cannot become lookup authority |
| subscription_plan | SaaS Subscription Plans / Payroll | D | NO | NO | NO | Platform Plan / immutable PlanVersion | Platform catalog; not a tenant Module binding | F:687 / 3 | EXCLUDE | Frozen commercial engine exists; remove duplicate UI category during allowed safety pass |
| shift_type | Shift & Roster Types / HR | F | NO | YES, via Shift | POSSIBLE future Shift template | Existing Shift | attendance | F:729 / 3 | EXCLUDE | Shift model exists; times/minimum hours not Generic values |
| skill_set | Employee Skill Sets / HR | A | YES | YES | YES | Master engine: skill label; later membership joins | NULL; workforce/core CRM unresolved | F:734 / 3 | HOLD | SaaS/POS-specific values need production-versus-demo review |
| document_type | KYC & Document Categories / HR | A | YES | YES | YES | Master engine: document label | NULL; workforce unresolved | F:739 / 3 | HOLD | Mandatory-document claims belong to separate compliance policy |
| product_category | Product & SKU Heads / Sales | B | NO | YES | POSSIBLE demo template | Tenant ProductCategory | order_management | F:744 / 3 | EXCLUDE | Target model absent; future product catalog, not SaaS pricing |
| deal_priority | Deal Priority Levels / Sales | A | YES | YES | YES | Master engine: priority label | core_crm | F:749 / 3 | HOLD | P0 description includes 24-hour closing threshold |
| competitor_brand | Competitor Brands / Sales | A | YES | YES | YES | Master engine: competitor label | core_crm | F:754 / 3 | HOLD | Three named POS/accounting brands are not approved universal defaults |
| demo_failure_reason | Demo Failure Reasons / Demos | A | YES | YES | YES | Master engine: failure label | demo_scheduler | F:759 / 3 | HOLD | Store/hardware-specific text requires default-source review |
| visit_objective | Field Check-in Objectives / Field | A | YES | YES | YES | Master engine: objective label | field_visits | F:764 / 3 | HOLD | Labels only; signing, KYC and onboarding remain domain behavior |
| visit_checklist | Field Visit Compliance Checklists / Field | C | NO | YES | YES, future policy | Versioned evidence checklist/workflow | field_visits | F:769 / 3 | EXCLUDE | Required photo, radius and sign-off rules; future visit domain |
| target_metric_type | Target Metric Types / Payroll | A | YES, controlled | YES | YES | Master engine: stable metric labels; later Target aggregation | NULL; targets/reporting unresolved | F:774 / 3 | HOLD | Revenue/count meanings and permitted edits require explicit contract |
| incentive_tier | Commission Tier Slabs / Payroll | C | NO | YES | YES, future policy | Effective-dated IncentivePolicy | payroll | F:779 / 3 | EXCLUDE | Achievement slabs and commission percentages |
| merchant_status | Merchant Lifecycle Statuses / Business | B | NO | YES | YES, future domain | Account lifecycle / transitions | core_crm | F:784 / 3 | EXCLUDE | Future Account model; not a shared generic status |
| payout_account | Disbursement Bank Accounts / Payroll | B | NO | YES | NO | Secured PayoutAccount / provider connection | payroll | F:789 / 2 | EXCLUDE | Target model absent; no bank/provider credentials in Masters |
| payout_frequency | Incentive Payout Frequencies / Payroll | C | NO | YES | YES, future policy | Payout scheduling policy | payroll | F:793 / 2 | EXCLUDE | Monthly/quarterly execution semantics |
| target_period | Target Periods & Quota Frequencies / Payroll | B | NO | YES | NO | TargetPeriod / fiscal calendar | Unresolved targets | F:797 / 4 | EXCLUDE | Target model absent; stale 2025 demo periods |
| target_type | Target Scope & Assignment Types / Payroll | A | YES, system-owned | YES | NO | Master engine: fixed assignment-scope values | NULL; targets unresolved | F:803 / 3 | HOLD | No arbitrary scope extension; exact policy flags still needed |
| target_status | Target Achievement Statuses / Payroll | C | NO | YES | YES, future policy | Derived achievement-status policy | Unresolved targets | F:808 / 4 | EXCLUDE | 60/80/100 percent thresholds; future Target domain |
| incentive_status | Incentive Disbursal Statuses / Payroll | C | NO | YES | NO | Incentive approval/payment state machine | payroll | F:814 / 4 | EXCLUDE | Workflow states, not free edits |
| incentive_rule_type | Incentive Calculation Methods / Payroll | C | NO | YES | YES, future policy | Incentive calculation strategy | payroll | F:820 / 3 | EXCLUDE | Percent, slab, multiplier behavior |

Module authority was checked against `apps/api/src/platform/modules/feature-registry.ts`, `MODULE_REGISTRY`: core_crm, field_visits, attendance, payroll, demo_scheduler, order_management, whatsapp_automation, ai_copilot. The six A-class NULL bindings above use the brief's explicitly permitted unresolved-mapping exception. NULL is not a guessed substitute Module or a commercial grant; unresolved definitions need later binding review. No `workforce`, `expenses`, `targets` or `reporting` Module was created.

## Concrete seed blockers and required decision

These are source facts, not newly interpreted operational rules. The category classification remains A; the unsafe content must be separated from the lookup labels before approval.

| Source row | Existing text / ambiguity | Required resolution before import |
| --- | --- | --- |
| F:704, followup_outcome / NOT_REACHABLE | "Phone went unanswered after 3 attempts." | Approve a label-only description without the attempt threshold; no follow-up policy is introduced |
| F:750, deal_priority / P0_URGENT | "High value hot deal closing within 24 hours." | Approve neutral urgency wording without a deadline/derived classification |
| F:740 and F:742, document_type / AADHAAR and DRIVING_LIC | "Mandatory Government Identity Card." and "Mandatory for two-wheeler field executives." | Approve document labels without employment/compliance requirements; no legal rule inferred |
| F:670–673, incentive_type | Percentage commission, deal threshold, flat-per-conversion and milestone reward meanings | Keep only explicitly reviewed heads; calculation and eligibility belong to later policies |
| F:676–679, allowance_type | Statutory component, fixed monthly and variable per-km meanings | Approve neutral label descriptions; no statutory/rate/scheduling contract inferred |
| F:683–685, deduction_type | Tax slab and pro-rata unapproved-absence deduction descriptions | Approve neutral deduction heads separately from statutory and attendance rules |
| F:755–757, competitor_brand | PETPOOJA / DOTPE / VYAPAR all marked system default | Decide whether these sector-specific brands are production SYSTEM defaults or demo-only; do not assign an Industry automatically |
| F:735–737 and F:775–777 | SaaS/POS skills and specific revenue/verified-visit/demo metric meanings | Review global-default applicability and immutable metric semantics; aggregation stays deferred |
| A-class custom-flagged rows | DIGITAL_ADS, EXPO; FEATURE_GAP; visit_type ONBOARDING; WEATHER, STORE_CLOSED; TOLL_PARKING; CONV_BONUS, QTR_CHAMP; FUEL_REIMB, MOBILE_DATA | Decide explicit production seed inclusion; the fixture flag does not identify a real Tenant or approve global ownership |
| Definition policy fields | Classification supplies general rules, not a complete per-definition create/edit/deactivate/system-value protection matrix | Approve exact flags, especially tightly controlled target_metric_type and system-owned target_type; do not invent protected-value behavior |

Recommended next decision: authorize a reviewed **label-only** canonical backend artifact, approve exact replacement descriptions and the production/demo disposition of every candidate, and approve the per-definition policy matrix before applying any seed. Until then all 86 rows remain review candidates, not an approved production default set. The decisive-test codes INBOUND and FIELD_PROSPECTING may be synthetic test data as the brief permits; they must not silently replace FIELD_VISIT/DIGITAL_ADS/EXPO in the production source.

## Current runtime path and legacy evidence

`AppRouter.tsx:504` applies `system.masters.view` to `/admin/masters`. `MasterManagementPage.tsx:60` initializes React state from `initialMasterRecords`; add/edit/toggle/delete update that local state. There is no Master API in this path. `AppShell.tsx:544` links the same route. The existing TENANT-scoped view permission is defined at `permission-registry.ts:531`; no Master manage permission or platform Master API was added in this audit.

`schema.prisma:468` defines global `MasterRecord` with `(category, code)` uniqueness, no Tenant, Industry-version or source ownership, and no value-reference relations. Repository searches across `apps` and `packages` found no Prisma MasterRecord service/query consumer or seed; schema and the historical migration are its backend references. `MasterRecordItem` is a separate frontend fixture interface, not persistence. Absence of a source consumer does **not** prove a deployed table is empty or that external consumers do not exist.

Production MasterRecord row counts, ownership, references and migration mapping are **UNKNOWN**. No production database was connected to or modified. No legacy row was migrated, guessed as SYSTEM/TENANT, deleted or retired. A read-only deployment inventory and explicit reviewed ownership mapping remain required; ambiguous rows must fail reconciliation. Keeping the old table is mandatory until that report proves safe retirement.

## Frozen integration boundary for resumption

Reuse existing PrismaService/PersistenceModule, SubscriptionTransactionService, normalized payload hashing, AuditLog, RequestPrincipal, selected-membership guards, PermissionsGuard and frozen SubscriptionAccessGuard. No new global runtime resolver/cache or job engine is justified.

M8 must add normalized Industry Master rows tied to the exact IndustryTemplateVersion. Frozen M7 schemaVersion 1 JSON stays `terminology: {}` and `masterDefaults: []`; published snapshots and old migrations remain unchanged. Production Industry Master rows start empty without an approved source. Additive M8 parent-locking/immutability triggers and an assignment-compatibility guard must be proved before any claim of working integration. A Tenant override referencing an old Industry Master row must fail migration with `MASTER_OVERRIDE_RECONCILIATION_REQUIRED`, not retarget by equal code. These are required future contracts, not implemented guarantees in this pass.

Module availability must continue to derive from Subscription -> pinned PlanVersion -> PlanModule -> eligible canonical Module. Recommendations, Master values and overrides must never alter commercial access, seats or RBAC. Minimal duplicate-category removal/non-authoritative UI labeling remains pending the implementation pass; no UI conversion or domain work occurred here.

## Verification and outcome

[GitHub Actions 34115652171](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34115652171) was verified through the authenticated GitHub API on the exact frozen baseline: success; all 22 historical migrations deployed; 74/74 unit tests in 12 suites; 91/91 E2E tests in 6 suites. This is baseline evidence, not an M8 run. No candidate or merged-main Phase 0.8 SHA exists.

Only this review and `PHASE_0_8_MASTER_ENGINE_IMPLEMENTATION.md` were added. No frozen file changed. Phase 0.8 is **BLOCKED before implementation** under seed stop conditions 2 and 3. **DO NOT START PHASE 0.9.**
