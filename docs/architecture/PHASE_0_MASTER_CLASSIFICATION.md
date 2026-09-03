# Phase 0 Master classification

## Classification key

- **A - Generic Master:** simple configurable lookup value.
- **B - Domain Entity:** has relationships, lifecycle, behavior, or reporting identity beyond a lookup.
- **C - Policy / Rule Engine:** contains thresholds, formulas, workflow logic, or derived state.
- **D - Platform Commercial Entity:** belongs to Plans, subscriptions, billing, or platform commerce.
- **E - Industry Configuration:** versioned industry-specific configuration rather than tenant business data.
- **F - Deprecated / Duplicate:** must be removed because another authority owns the same concept.

Every current category below has exactly one primary classification. Some rows note a split migration because the present static category combines a lookup label with logic. In those cases, the current category is classified by its risk-bearing semantics and the simple label may become a separate Generic Master.

## Complete current classification

| Category / current group                        | Current static records                                                       | Class | Actual domain / authoritative target                                                        | Generic Master?         | Tenant scoped?  | Industry default?      | Module dependency           |
| ----------------------------------------------- | ---------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- | ----------------------- | --------------- | ---------------------- | --------------------------- |
| `designation` - HR & Personnel                  | Field Executive; Senior Sales Executive; Team Leader; Regional Sales Manager | A     | Workforce designation values                                                                | Yes                     | Yes             | Yes                    | `attendance`/workforce core |
| `team` - HR & Personnel                         | Western Suburbs; Central Suburbs; Thane Cluster; South Mumbai Enterprise     | B     | `Team` with leader, members, hierarchy, targets                                             | No                      | Yes             | No                     | core workforce              |
| `contact_role` - HR & Personnel                 | Owner; Store Manager; Operations Head; Accountant                            | A     | Account contact-role values                                                                 | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `leave_type` - HR & Personnel                   | Casual; Sick; Earned; Official Duty                                          | A     | Leave type value; accrual/approval remains separate policy                                  | Yes                     | Yes             | Yes                    | `attendance`                |
| `followup_type` - Demos & Follow-ups            | Quotation; Demo; Product Info; Payment                                       | A     | Follow-up type values                                                                       | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `followup_outcome` - Demos & Follow-ups         | Send Quote; Demo Requested; Rescheduled; Not Reachable                       | A     | Follow-up outcome values                                                                    | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `demo_type` - Demos & Follow-ups                | Walkthrough; Onsite POC; Virtual Demo                                        | A     | Demo delivery mode values                                                                   | Yes                     | Yes             | Yes                    | `demo_scheduler`            |
| `gps_exception_type` - Operations & Field       | Mock GPS; GPS Off; Boundary Breach; Long Idle                                | C     | GPS exception detection policy; emitted exception type codes may be system-owned values     | No                      | Yes             | Yes                    | `field_visits`              |
| `transport_mode` - Operations & Field           | Bike at INR 4.5/km; Car at INR 9/km; public transport                        | C     | Split `TransportMode` lookup from effective-dated reimbursement policy/rate                 | No as currently modeled | Yes             | Yes                    | `payroll`/expenses          |
| `task_activity_type` - Operations & Field       | Site Visit; Phone Call; WhatsApp/Email Broadcast                             | A     | Activity type values                                                                        | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `lead_stage` - Sales & Pipeline                 | New; Site Visit; Proposal; Closed Won; Closed Lost                           | B     | `PipelineDefinition` and ordered `PipelineStage`                                            | No                      | Yes             | Yes                    | `core_crm`                  |
| `lead_source` - Sales & Pipeline                | Field Visit; Referral; Digital Ads; Expo                                     | A     | Lead source values                                                                          | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `lost_reason` - Sales & Pipeline                | Price; Competitor; Unresponsive; Feature Gap                                 | A     | Lost-reason values                                                                          | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `lead_rating` - Sales & Pipeline                | Hot; Warm; Cold                                                              | C     | Rating/scoring policy plus derived rating; labels alone may be system values                | No                      | Yes             | Yes                    | `core_crm`                  |
| `territory` - Operations & Field                | Andheri/BKC; Powai; Thane Belapur                                            | B     | `Territory`, hierarchy, boundary, pincode and assignments                                   | No                      | Yes             | Possibly template      | `core_crm`/`field_visits`   |
| `visit_type` - Operations & Field               | Sales Pitch; Follow-up; Collection; Onboarding                               | A     | Visit type values                                                                           | Yes                     | Yes             | Yes                    | `field_visits`              |
| `visit_reason` - Operations & Field             | Owner unavailable; rescheduled; weather; closed                              | A     | Visit cancellation reason values                                                            | Yes                     | Yes             | Yes                    | `field_visits`              |
| `expense_category` - Operations & Field         | Fuel; Client Meeting; Toll/Parking                                           | A     | Expense category values                                                                     | Yes                     | Yes             | Yes                    | expenses/payroll            |
| `business_type` - Business & Merchants          | Gym; Food & Beverage; Supermarket; Salon; Clinic                             | A     | Account/business category values                                                            | Yes                     | Yes             | Strongly yes           | `core_crm`                  |
| `business_scale` - Business & Merchants         | Micro; Small; Medium; Enterprise with turnover bands                         | C     | Effective-dated classification thresholds; derived scale                                    | No                      | Yes             | Yes                    | `core_crm`                  |
| `market_hub` - Business & Merchants             | Orion Mall; FC Road; Hill Road; Wagle                                        | B     | Geographic MarketHub with address/boundary and account relations                            | No                      | Yes             | Possibly               | `core_crm`/`field_visits`   |
| `incentive_type` - Payroll & Subscriptions      | Deal Commission; High Value Bonus; Conversion Bonus; Champion                | A     | Incentive head/type; calculation stays in policies                                          | Yes                     | Yes             | Yes                    | `payroll`                   |
| `allowance_type` - Payroll & Subscriptions      | HRA; Conveyance; Fuel; Mobile/Data                                           | A     | Allowance head values                                                                       | Yes                     | Yes             | Yes                    | `payroll`                   |
| `deduction_type` - Payroll & Subscriptions      | PF; TDS; Professional Tax; LOP                                               | A     | Deduction head values; statutory formula is policy                                          | Yes                     | Yes             | Yes                    | `payroll`                   |
| `subscription_plan` - Payroll & Subscriptions   | Starter; Professional; Enterprise Growth                                     | D     | Platform `Plan` and immutable `PlanVersion`                                                 | No                      | No              | No                     | Platform Catalog            |
| `shift_type` - HR & Personnel                   | Morning; Flexible; Evening Audit                                             | F     | Duplicate of existing tenant-scoped `Shift` domain entity                                   | No                      | Yes via `Shift` | Template may seed      | `attendance`                |
| `skill_set` - HR & Personnel                    | B2B SaaS Sales; POS Setup; Payment Recovery                                  | A     | Skill values and membership-skill joins                                                     | Yes                     | Yes             | Yes                    | workforce/core CRM          |
| `document_type` - HR & Personnel                | Aadhaar; PAN; Driving Licence                                                | A     | Document type values with separate compliance requirements policy                           | Yes                     | Yes             | Yes                    | workforce                   |
| `product_category` - Sales & Pipeline           | POS Hardware; Field SaaS; WhatsApp Suite                                     | B     | Tenant business `ProductCategory`; not platform SaaS pricing                                | No                      | Yes             | Possible demo template | `order_management`          |
| `deal_priority` - Sales & Pipeline              | Urgent P0; High P1; Normal P2                                                | A     | Deal priority values                                                                        | Yes                     | Yes             | Yes                    | `core_crm`                  |
| `competitor_brand` - Sales & Pipeline           | Petpooja; DotPe; Vyapar                                                      | A     | Competitor values                                                                           | Yes                     | Yes             | Strongly yes           | `core_crm`                  |
| `demo_failure_reason` - Demos & Follow-ups      | Network Offline; Owner Absent; Incompatible Hardware                         | A     | Demo failure reason values                                                                  | Yes                     | Yes             | Yes                    | `demo_scheduler`            |
| `visit_objective` - Operations & Field          | First Pitch; Onsite Demo; Contract/Onboarding                                | A     | Visit objective values                                                                      | Yes                     | Yes             | Yes                    | `field_visits`              |
| `visit_checklist` - Operations & Field          | Store Photo; GPS Stamp; Merchant Sign-off                                    | C     | Versioned checklist/workflow template with required evidence rules                          | No                      | Yes             | Yes                    | `field_visits`              |
| `target_metric_type` - Payroll & Subscriptions  | Revenue; Visit count; Demo count                                             | A     | Stable metric type definitions; actual aggregation implemented in Target service            | Yes, tightly controlled | Yes             | Yes                    | targets/reporting           |
| `incentive_tier` - Payroll & Subscriptions      | 5%, 8%, 12% achievement slabs                                                | C     | Effective-dated IncentivePolicy tiers/formulas                                              | No                      | Yes             | Yes                    | `payroll`                   |
| `merchant_status` - Business & Merchants        | Unverified; Active Prospect; Live Customer                                   | B     | Account lifecycle/pipeline state model; not an arbitrary value once transitions exist       | No                      | Yes             | Yes                    | `core_crm`                  |
| `payout_account` - Payroll & Subscriptions      | HDFC Corporate; RazorpayX                                                    | B     | Secured `PayoutAccount`/provider connection with masked credentials                         | No                      | Yes             | No                     | `payroll`                   |
| `payout_frequency` - Payroll & Subscriptions    | Monthly; Quarterly                                                           | C     | Payout scheduling policy                                                                    | No                      | Yes             | Yes                    | `payroll`                   |
| `target_period` - Payroll & Subscriptions       | May 2025; June 2025; Q2; FY 2025-26                                          | B     | `TargetPeriod` with dates, status and fiscal calendar; current fixtures are stale demo data | No                      | Yes             | No                     | targets                     |
| `target_type` - Payroll & Subscriptions         | Team; Individual; Territory                                                  | A     | Target assignment-scope enum/value                                                          | Yes/system-owned        | Yes             | No                     | targets                     |
| `target_status` - Payroll & Subscriptions       | On Track; At Risk; Behind; Exceeded with thresholds                          | C     | Derived achievement-status policy; status is calculated, not freely edited                  | No                      | Yes             | Yes                    | targets                     |
| `incentive_status` - Payroll & Subscriptions    | Draft; Approved; Verified; Paid                                              | C     | Incentive workflow/state machine and permissions                                            | No                      | Yes             | No                     | `payroll`                   |
| `incentive_rule_type` - Payroll & Subscriptions | Revenue percent; fixed slab; multiplier                                      | C     | Incentive calculation strategy/policy                                                       | No                      | Yes             | Yes                    | `payroll`                   |

Counts: 24 Generic Masters (A), 9 Domain/Commercial Entities (B/D), 10 Policies (C), and 1 deprecated duplicate (`shift_type`) = 44 categories. The exact class label on each row is authoritative; counts should be recalculated automatically if classifications change.

## Critical duplicate and conflict resolution

| Conflict                                                  | Single authority                                             | Migration action                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Team Master vs Prisma `Team` vs Team screens              | Tenant-scoped Team entity                                    | Migrate any legitimate values into Team; remove `team` MasterDefinition                        |
| Shift Master vs Prisma `Shift` vs `shift_type`            | Tenant-scoped Shift entity                                   | Map valid templates into Shift seed/template; remove `shift_type` Master category              |
| SaaS Subscription Plan Master vs Plans & Pricing fixtures | Platform Plan/PlanVersion                                    | Remove `subscription_plan` from tenant Masters; migrate reviewed commercial configuration only |
| Territory Master vs territory screen model                | Tenant-scoped Territory entity                               | Preserve codes through entity migration; do not keep dual editable sources                     |
| Lead Stage Master vs pipeline fixtures                    | PipelineDefinition/PipelineStage                             | Migrate ordered stages, transition rules, terminal semantics                                   |
| Product Category Master vs future Product catalog         | Tenant ProductCategory entity                                | Move records when Order context is implemented; no platform-plan relationship                  |
| Business/merchant status vs Lead/Pipeline status          | Explicit Account lifecycle and Lead/Pipeline stage           | Define distinct vocabularies and transitions; do not share one ambiguous status code           |
| Incentive type/tier/rule/status in one Master page        | Incentive type Master plus IncentivePolicy/Workflow entities | Split lookup heads from formulas, approvals and payouts                                        |
| Transport mode labels containing rates                    | TransportMode Master plus ReimbursementPolicy                | Strip currency/rate from display name and version the rate separately                          |

## Master data model

### `MasterDefinition`

```text
id, code, name, description, moduleCode?, valueType,
allowTenantCreate, allowTenantEdit, allowTenantDeactivate,
allowIndustryDefaults, systemValuePolicy,
displayOrder, status, metadataSchemaJson?, createdAt, updatedAt
```

- Platform/system-owned; tenant admins cannot create or edit definitions.
- `moduleCode` controls visibility and availability.
- `metadataSchemaJson` is a versioned, allow-listed schema for harmless value metadata. It is not a generic rule engine.

### `MasterValue`

```text
id, definitionId, source(SYSTEM|INDUSTRY|TENANT),
tenantId?, industryTemplateVersionId?, code, name, description?,
displayColor?, sortOrder, isActive, metadataJson?,
createdByUserId?, createdAt, updatedAt
```

Exactly one scope owner is set:

- SYSTEM: `tenantId` and industry version are null.
- INDUSTRY: industry version set, tenant null.
- TENANT: tenant set, industry version null.

Use database check constraints in the migration. Stable `code` is immutable after use. Tenant codes are unique per `(tenantId, definitionId, code)`; system and industry scopes have equivalent scoped unique constraints.

### `MasterValueOverride`

```text
id, inheritedMasterValueId, scope(INDUSTRY|TENANT),
tenantId?, industryTemplateVersionId?, displayName?, displayColor?,
sortOrder?, isHidden, createdAt, updatedAt
```

Overrides preserve the inherited value ID and code. They never clone an inherited row merely to rename it.

## Effective-value resolution

Resolution order:

```text
SYSTEM DEFAULT
  -> INDUSTRY TEMPLATE additions/overrides
  -> TENANT additions/overrides
  -> filter by effective Module availability
  -> sort deterministically
```

Rules:

1. System values establish stable codes. Industry and Tenant sources may add codes if definition policy permits.
2. A Tenant may hide an inherited value only when `allowTenantDeactivate` is true and the value is not required by system/workflow integrity.
3. Industry or Tenant may override display name/color/order only when policy permits; the stable inherited code never changes.
4. Hiding a value removes it from new selections. Existing records retain the foreign key and render the historical label snapshot or inactive value.
5. A Tenant cannot edit an Industry or System row directly.
6. Code collision precedence is not silent. A child addition cannot reuse an inherited code; it must override the inherited row or choose a new code.
7. The effective list is deterministic by explicit effective sort, source precedence only as a tie-breaker, then code.
8. Definition and value changes increment runtime config version and evict Master cache.

Example:

```text
Lead Source system values: REFERRAL, INBOUND, FIELD_PROSPECTING
Industry value: MEDICAL_CONFERENCE
Tenant value: DOCTOR_REFERRAL
Tenant rename override: REFERRAL -> Partner referral

Effective result:
REFERRAL (displayed as Partner referral), INBOUND, FIELD_PROSPECTING,
MEDICAL_CONFERENCE, DOCTOR_REFERRAL
```

## Module-aware behavior

- A definition with `moduleCode` appears only if the Subscription's PlanVersion includes that Module and the Module lifecycle permits runtime use.
- `payroll` unavailable: allowance, deduction, incentive and payout configuration is absent from bootstrap and tenant navigation.
- `order_management` unavailable: tenant Product/PriceBook configuration is absent.
- `field_visits` unavailable: Visit/GPS/checklist values are absent.
- Turning a Module off through subscription change does not delete its configuration. Values remain archived/inaccessible and can reactivate if the Module returns.

## Management experiences

### Platform: `/platform/configuration/masters`

Manages definitions, system values, Industry defaults, override policies, module dependencies, schema/version metadata, and audit history. This needs platform configuration permissions, not tenant domain permissions.

### Tenant: `/admin/masters`

Preserve the existing category navigation, search, filters, DataTable, Add/Edit modal, status, sorting, and system-default indicators. Replace only the data plumbing:

```text
MasterManagementPage
  -> useEffectiveMasters / useMasterMutations
  -> MasterService interface
  -> NestJS Master API
  -> PostgreSQL definitions, values, overrides
```

Tenant admins see effective values and may only perform actions allowed by the definition. System and Industry rows show their source and offer permitted hide/rename actions, never direct edit/delete.

## Pricing and policy boundaries

### Platform SaaS pricing

Owned by `Plan`, `PlanVersion`, `PlanPricing`, `TenantSubscription`, future platform Invoice and Transaction. It determines what the SaaS tenant pays and which Modules are included.

### Tenant business pricing

Owned later by `Product`, `SKU`, `PriceBook`, Tax, Discount and Order. It determines what the tenant charges its customers. It has no relation to platform Plan pricing except that its screens require the `order_management` Module.

### Master vs policy

A Master is a selectable value with no calculations or transition logic. A Policy contains rates, thresholds, formulas, eligibility, approvals, effective dates, or state transitions. Examples: Expense Category is a Master; mileage rate is a Policy. Leave Type is a Master; accrual rule is a Policy. Incentive Type is a Master; commission slab is a Policy.

## Migration of current static data

1. Freeze and export the 44-category fixture snapshot for review; do not import it wholesale.
2. Create new MasterDefinition/Value/Override tables in a new migration; never edit applied migrations.
3. Seed only approved A-class definitions and system defaults idempotently.
4. Implement B/D entities and C policies in their owning phases; until then keep current UI fixture-only and visibly non-authoritative.
5. Migrate `subscription_plan` to Plan/PlanVersion and `shift_type` to Shift; remove duplicate categories from tenant navigation.
6. Keep development/demo records in a separate opt-in seed.
7. Retire `MasterRecord` after all real consumers have moved and a reconciliation report proves no orphaned references.
