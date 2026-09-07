# Phase 0.7 Industry fixture review

Status: **25/25 source entries inspected; terminology/Master-default contract decision pending.**

Audit date: 2026-09-07. Baseline: `dfafcb928ad6c907d54508953b703bef504d4ddb` in `solverixtech-code/Smart-Field-Work-Saas`. This is a source and architecture review, not product approval or a completed backend implementation.

## Sources and exact scope

The authoritative source for this review is `apps/web/src/features/platform/tenants/fixtures/platform.fixtures.ts:3`, array `PLATFORM_INDUSTRIES`, lines 4–28. Its declared shape is `IndustryConfig` in `apps/web/src/features/platform/tenants/types/platform.types.ts:62`.

All 25 entries have exactly six properties: id, code, label, category, description, defaultModules. None supplies terminology, Master defaults, forms, workflows, dashboard configuration, version history, approval evidence, or exact Tenant version mappings. Descriptive phrases such as doctor visits, warranty audits, or dispatch are prose, not declarative configuration contracts.

The frozen `MODULE_REGISTRY` in `apps/api/src/platform/modules/feature-registry.ts` owns valid Module codes. M6's classification seed uses the same 25 Industry codes. `IndustryClassification` is a non-versioned classification table and cannot identify a template version.

## Property classification

| Property or related data | Classification | Import decision |
| --- | --- | --- |
| code | PHASE_0.7 AUTHORITATIVE candidate | Preserve stable uppercase code; validate against existing classification; no implicit alias merging |
| label | PHASE_0.7 AUTHORITATIVE candidate | Template display name, not a business-object terminology label |
| category | PHASE_0.7 AUTHORITATIVE candidate | Plain display/category metadata; no resolver or permission meaning |
| description | PHASE_0.7 AUTHORITATIVE candidate | Plain descriptive text only; references to business workflows confer no implementation or authority |
| defaultModules | PHASE_0.7 AUTHORITATIVE advisory metadata | Import as normalized recommendations to registered Modules; never entitlements |
| id (`ind_*`) | DEMO-ONLY | Retain in review/import provenance; never use as a generated backend UUID or version ID |
| terminology | Absent | No key allowlist or concrete values can be derived from these entries |
| Master defaults | Absent | No future Master code/value authority exists in these fixtures; product contract required before nonempty snapshots |
| Effective Master values/overrides | PHASE_0.8 DEFERRED | No MasterDefinition/MasterValue/MasterValueOverride creation |
| Effective runtime labels, modules, merged defaults | PHASE_0.9 DEFERRED | No runtime resolver, bootstrap, cache or precedence engine |
| Domain behavior described in description | DOMAIN-DEFERRED | No executable field-visit, sales, claims, audit, dispatch or other workflow import |
| Mock Tenant industryId/code/label and demo metrics | DEMO-ONLY | Not production assignment or commercial-mapping evidence |
| Known historical aliases attendance_plus/payroll_engine | INVALID / OBSOLETE | Reviewed import mapping is attendance/payroll respectively; neither alias occurs in these 25 current entries |

“Authoritative candidate” means eligible for a reviewed DRAFT import. It does not mean the frontend fixture is production-approved.

## Complete entry review matrix

Every source reference below is relative to `apps/web/src/features/platform/tenants/fixtures/platform.fixtures.ts`. T/M = terminology/Master defaults present. The common findings immediately after the matrix apply to every row explicitly.

| Code | Display name | Category | Source line / fixture ID | Canonical recommendations | T/M | Publication approval |
| --- | --- | --- | --- | --- | --- | --- |
| PHARMA | Pharma & Healthcare | Healthcare | 4 / ind_pharma | core_crm, field_visits, demo_scheduler | absent / absent | DRAFT candidate only |
| FMCG | FMCG & Consumer Goods | Retail & Consumer | 5 / ind_fmcg | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| SOLAR | Solar & Renewable Energy | Energy & Utilities | 6 / ind_solar | core_crm, field_visits | absent / absent | DRAFT candidate only |
| RETAIL | Retail & Franchise Ops | Retail & Consumer | 7 / ind_retail | core_crm, field_visits, attendance | absent / absent | DRAFT candidate only |
| CONSTRUCTION | Construction & Real Estate | Real Estate & Infra | 8 / ind_construction | core_crm, field_visits | absent / absent | DRAFT candidate only |
| BANKING | Banking & Financial Services | BFSI | 9 / ind_banking | core_crm, field_visits, demo_scheduler | absent / absent | DRAFT candidate only |
| INSURANCE | Insurance & Mutual Funds | BFSI | 10 / ind_insurance | core_crm, field_visits, whatsapp_automation | absent / absent | DRAFT candidate only |
| TELECOM | Telecom & ISP Operations | Telecommunications | 11 / ind_telecom | core_crm, field_visits | absent / absent | DRAFT candidate only |
| LOGISTICS | Logistics & Supply Chain | Transport & Freight | 12 / ind_logistics | core_crm, field_visits, attendance | absent / absent | DRAFT candidate only |
| AGRI | Agri Inputs & Crop Protection | Agriculture | 13 / ind_agri | core_crm, field_visits, demo_scheduler | absent / absent | DRAFT candidate only |
| AUTOMOTIVE | Automotive & Auto Components | Manufacturing | 14 / ind_automotive | core_crm, field_visits, demo_scheduler | absent / absent | DRAFT candidate only |
| EDTECH | EdTech & Higher Education | Education | 15 / ind_edtech | core_crm, demo_scheduler, whatsapp_automation | absent / absent | DRAFT candidate only |
| CHEMICAL | Chemicals & Specialty Materials | Manufacturing | 16 / ind_chemical | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| DURABLES | Consumer Durables & Electronics | Retail & Consumer | 17 / ind_durables | core_crm, field_visits, attendance | absent / absent | DRAFT candidate only |
| APPAREL | Apparel & Fashion Brands | Retail & Consumer | 18 / ind_apparel | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| HARDWARE | Paints & Building Hardware | Real Estate & Infra | 19 / ind_hardware | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| MEDICAL_DEVICE | Medical Devices & Equipment | Healthcare | 20 / ind_medical | core_crm, field_visits, demo_scheduler | absent / absent | DRAFT candidate only |
| HOSPITALITY | Hospitality & HORECA | Services | 21 / ind_hospitality | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| WASTE_MGMT | Waste Management & ESG | Services & ESG | 22 / ind_waste | core_crm, field_visits | absent / absent | DRAFT candidate only |
| FACILITY | Facility Management & Security | Services | 23 / ind_facility | core_crm, field_visits, attendance | absent / absent | DRAFT candidate only |
| TEXTILE | Textiles & Yarn Spinning | Manufacturing | 24 / ind_textile | core_crm, field_visits, order_management | absent / absent | DRAFT candidate only |
| POWER_DIST | Power & Utility Metering | Energy & Utilities | 25 / ind_power | core_crm, field_visits | absent / absent | DRAFT candidate only |
| DIAGNOSTICS | Diagnostics & Pathology Labs | Healthcare | 26 / ind_diagnostics | core_crm, field_visits | absent / absent | DRAFT candidate only |
| ECOM_LOGISTICS | E-Commerce Hyperlocal Delivery | Transport & Freight | 27 / ind_ecom | core_crm, field_visits, attendance | absent / absent | DRAFT candidate only |
| SOFTWARE_SAAS | Software & Cloud SaaS Services | Technology | 28 / ind_saas | core_crm, demo_scheduler, whatsapp_automation | absent / absent | DRAFT candidate only |

Per-entry common findings: no unsupported extra properties; no executable config; no obsolete recommendation codes; no unknown recommendation codes; no repeated recommendation within an entry; no duplicate normalized Industry codes. All recommended Modules are ACTIVE in the frozen registry; all field_visits/demo_scheduler/order_management dependencies on core_crm are present. Similar categories or descriptive overlap do not justify merging distinct Industry codes. Every row has the same unresolved terminology/default-definition gap and the same commercial restriction: recommendations grant nothing.

Counted recommendations: core_crm 25, field_visits 23, demo_scheduler 7, order_management 6, attendance 5, whatsapp_automation 3. Total 69 recommendation references to six distinct Modules. Production-approved templates: **0 evidenced**. Draft candidates: 25. Historical mappings `attendance_plus -> attendance`, `payroll_engine -> payroll` remain relevant to importer regression tests, but current-source replacements required: **0**. Unknown codes must fail, never be dropped or created.

## Tenant classification read/write inventory

| Source | Existing behavior | M7 boundary |
| --- | --- | --- |
| schema.prisma / Tenant.industryCode | Nullable FK to IndustryClassification.code | Preserve; add version assignment alongside it |
| M6 classification migration | Adds column/FK and seeds all 25 classifications | Immutable migration; not template/version seed approval |
| provisioning.service.ts | Normalizes/validates classification and writes it atomically during provisioning | Frozen; no redesign or inferred template pin |
| subscription-reconciliation.service.ts | Explicit classification input; rejects conflicts; writes reviewed mapping | Frozen; does not identify IndustryTemplateVersion |
| M6.1/M6.2 triggers | Require classification for provisioned Tenant; prohibit its removal | Preserve |
| platform-subscriptions.controller.ts / ProvisioningService.industries | GET /platform/industry-classifications returns active code/name under platform.tenants.view | Classification API remains separate from template lifecycle |
| web platform.types.ts / Tenant and IndustryConfig | Separate frontend industryId/code/label | Display model; no exact published-version assignment |
| web FixtureTenantService.createTenant/updateTenant | Resolves classification by fixture ID and copies code/label | Demo-only path; no backend template mutation |
| TenantCreationContext | Defaults/restores ind_pharma | Frontend assumption; never a backend default pin |
| CreateTenantWizardPage | Lists fixtures, recommends defaultModules, contains first-entry fallback | Phase 0.11 frontend conversion; not authoritative M7 assignment |
| TenantDetailsPage | Displays/edits classification through fixture assumptions | No backend cross-template reclassification contract |
| AllTenantsPage / TenantUsersPage / TenantModulesPage | Label-based display/filtering | Leave unchanged |
| PlatformDashboardPage / lead screen data | Display-only Industry names and unrelated CRM industry strings | DEMO-ONLY / DOMAIN-DEFERRED; no canonical alias evidence |

## Missing product contract and concrete decision

Repository-wide terminology/Master-default searches found only future architecture shapes. `PHASE_0_ENTITY_OWNERSHIP_MATRIX.md` sketches `terminology: Record<string,string>` and generic Master rows in a future runtime DTO. It supplies no terminology key allowlist, no Industry-specific values, no approved future Master codes for these entries, and no import schema. `PHASE_0_MASTER_CLASSIFICATION.md` classifies future ownership; it does not attach default sets to these 25 Industries.

The Phase 0.7 brief requires both a strict reviewed contract and tests publishing v2 with changed terminology/defaults, while forbidding invented terminology keys and arbitrary fixture JSON. Those requirements cannot be satisfied from these source entries alone.

Historical alternatives presented after backend continuation:

1. Supply the approved terminology key allowlist and Master-default code/value schemas, including concrete values for the required nonempty v1/v2 tests; or
2. Explicitly narrow schemaVersion 1 to empty terminology/default snapshots, rejecting nonempty values until later product approval, and defer the nonempty terminology/default-change exit tests accordingly.

Finalization decision: the user's subsequent instruction permits explicit deferral, and this pass adopts option 2. Empty terminology/default snapshots are the complete supported Phase 0.7 contract. Nonempty content and the original nonempty-change proof remain explicitly deferred to a separately authorized product-contract follow-up. The strengthened 0.7 exit test must prove empty v1/v2 snapshots, changed recommendations, exact Tenant pins, immutable history and unchanged commercial authority, plus rejection of nonempty content. This is not production approval for any fixture and does not authorize Phase 0.8.

No domain labels or Master codes have been inferred from descriptions. Seed publication approval is a separate issue: the brief already authorizes DRAFT candidate import when product approval is absent, so missing publication approval does not itself require a second authorization to create candidates. Production assignment still needs exact reviewed published-version mappings.
