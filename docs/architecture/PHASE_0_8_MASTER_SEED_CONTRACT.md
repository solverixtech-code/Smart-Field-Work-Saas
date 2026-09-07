# Phase 0.8 Master seed contract

Contract revision: **1 — OWNER APPROVED**.
Owner approval: **GIVEN on 2026-09-07**, by the explicit response "approved" to the revision 1 contract review. The owner approved the 24-definition policies, 44 System values, exclusions, display manifest and deferred bindings below. Approval authorizes Phase 0.8 implementation, not production seed application, automatic legacy mapping or a release/freeze claim.

Approval evidence: the reviewed document's pre-approval SHA-256 was `e204e33814e720d0bfb69ddb21af8571186e5833b4cf0807e9a8b35887c8656a`. The content below records the original proposal and review; its decision tables are unchanged. References below to awaiting approval describe that historical review, not the current authorization status. Implementation progress is tracked separately in `PHASE_0_8_MASTER_ENGINE_IMPLEMENTATION.md`.

Repository: `solverixtech-code/Smart-Field-Work-Saas`.
Checkout: `C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas`.
Frozen baseline / inspected HEAD: `8709198fecd4e180b21358138eb5708d509c106d`.
Branch: `feat/phase-0.8-master-engine`.
Review date: 2026-09-07.

This pass is documentation only. Phase 0.1–0.7 remain FROZEN. Phase 0.8 implementation must wait for explicit owner approval of this contract. Phase 0.9 remains UNAUTHORIZED. No Prisma, M8, backend, RBAC, Industry, Subscription, Plan, Tenant, Identity or frontend-fixture changes are included. No database was queried or seeded, and no commit/push/PR was made.

## Sources and precedence

Reviewed sources:

- [Authoritative classification](PHASE_0_MASTER_CLASSIFICATION.md).
- [Phase 0.8 authority review](PHASE_0_8_MASTER_AUTHORITY_REVIEW.md).
- [Phase 0.8 implementation/gate report](PHASE_0_8_MASTER_ENGINE_IMPLEMENTATION.md).
- `apps/web/src/screens/admin/masters/systemMastersData.ts`: historical names, descriptions, stable codes, colors, order and flags.
- `apps/api/src/platform/modules/feature-registry.ts`: canonical `MODULE_REGISTRY`.

The two earlier 0.8 reports describe the accepted prerequisite stop and remain unchanged historical evidence. This revision resolves their candidate-disposition and proposed-policy questions for owner review; it does not turn their unimplemented/unverified gates green. The latest seed-finalization instruction permits neutralization and empty definitions, so bad descriptions alone no longer require stopping this contract work.

Immutable source snapshot is the Git blob at the frozen SHA, not a live runtime import:

| Source | Git-blob SHA-256 |
| --- | --- |
| Frontend Master fixture | `831fb902b1231329dbb072c0b1de8e5a988865acf5ddc93d2b74a65c4421c80b` |
| Classification document | `142b8875ffc51d82f60a9cf6158c98784320cf22ebc488f7e9f1781819fff6de` |

Hashes are over exact Git blob bytes (LF), avoiding checkout CRLF differences. The fixture is not production authority; after a separately authorized implementation and reviewed seed apply, PostgreSQL is authoritative. No legacy `MasterRecord` ownership, tenant mapping or production-data approval is inferred here.

The source was parsed as TypeScript literal data with the repository's existing TypeScript parser, not executed as a frontend module. The 44 category identities match the classification exactly: A=24, B=8, C=10, D=1, F=1. There are 153 total fixture rows; exactly 86 belong to A and 67 do not. Every A candidate appears exactly once below. No B/C/D/F category is a Generic seed candidate.

## Decision boundary and dispositions

The 24 definition identities in the definition table are fixed. No `subscription_plan`, `shift_type`, `team`, `lead_stage`, `territory`, `product_category`, `market_hub`, `merchant_status` or Policy definition is added.

Each candidate has exactly one disposition:

- **PRODUCTION_SYSTEM:** proposed inclusion in the production seed as `source=SYSTEM`, with no Tenant or Industry-version owner. Only the proposed name/description and the explicit display manifest below may be copied; never the policy-bearing original description.
- **DEFINITION_ONLY:** this candidate contributes no value row to the production seed. Its definition ships with zero System values. Later Industry or Tenant additions require their own valid, authorized writes under the definition policy. This is NOT a fourth database source, not a tenant backfill and not an automatic Industry assignment.
- **DEMO_ONLY:** no production row. The historical fixture may remain useful in explicitly isolated demo/test material; that does not authorize executing unsafe rules or automatically importing it anywhere.

The nine zero-System definitions are designation, leave_type, business_type, incentive_type, allowance_type, deduction_type, skill_set, document_type and competitor_brand. Their 29 DEFINITION_ONLY candidates and five DEMO_ONLY candidates account for 34 rows. The remaining eight DEMO_ONLY candidates belong to definitions that also have production defaults. Thus **44 production + 29 definition-only candidates + 13 demo-only = 86**. Definitions are counted separately from candidates.

All 11 custom-flagged candidates are DEMO_ONLY. The two additional demo exclusions are `deduction_type/LOP_PENALTY` and `target_metric_type/REVENUE_INR`. No custom fixture is promoted to a Tenant or System row. Conversely, a true system-default flag is not approval: sector, geography and organization-specific rows are excluded even when that historical flag is true.

## Label-only meaning

These values name selectable concepts only. They do not prescribe rates, percentages, thresholds, formulas, deadlines, SLAs, attempt counts, mandatory evidence, compliance, approvals, automatic transitions, effective dates, aggregation or payment behavior. Selecting an objective such as onboarding does not execute a checklist; selecting a role does not grant authority; selecting a priority does not start a timer.

Reported outcomes and failure reasons are labels, not executable transition predicates. A metric can name a count without defining which domain events qualify or how to aggregate them. Target, payroll, leave and compliance behavior remains in separately authorized future domains.

No new value code is invented, and no existing code is renamed. All 44 proposed System codes retain the source identity. Three display names are explicitly neutralized: P0_URGENT -> Urgent (P0), P1_HIGH -> High (P1), P2_NORMAL -> Normal (P2), removing action/pitch/cadence wording without changing priority codes. All other candidate names are retained. Definitions receive the neutral platform labels specified below; that is not an edit of the incumbent frontend.

For excluded candidates, proposed descriptions are review-only neutral wording, not advance approval to seed them later. The original fixture stays byte-for-byte unchanged. Competitor product descriptions are historical candidate text, not newly verified product claims.

## Definition policy semantics

The following are explicit proposed contract vocabulary, not existing Prisma enums or implemented APIs. The future implementation must encode these semantics consistently rather than treating these names as already available code.

All definitions have `valueType=LABEL`, `status=ACTIVE`, and the exact 1-based `displayOrder` shown in notes. ACTIVE means a usable lookup definition subject to authorization/module availability, not a domain capability grant. All have `metadataSchema=NONE`: no extensible metadata, formula, JSON policy or executable content is accepted. Colors and order are the dedicated presentation fields, not metadata. Omitted metadata corresponds to no metadata; nonempty metadata must be rejected.

Flags mean:

- `allowTenantCreate`: create independent TENANT label values; never a definition, SYSTEM/INDUSTRY row, inherited-code duplicate, domain object or grant.
- `allowTenantEdit`: edit owned label presentation and permit the explicitly allowed inherited presentation overrides. Codes, definition/source/ownership remain immutable. Inherited descriptions are not overridden; only name/color/order are.
- `allowTenantDeactivate`: deactivate/reactivate an owned label or hide/unhide an inherited label through an override. Never mutate the inherited row, hard-delete retained history or override a platform-inactive value into activity.
- `allowIndustryDefaults`: permit draft Industry label additions and permitted presentation/hide overrides. It never supplies production values automatically and never makes a published version mutable. Tenant presentation permissions on inherited Industry rows follow the same policy profile as inherited System rows.

| systemValuePolicy | Tenant rename System value | Tenant hide/unhide System value | Tenant color override | Tenant sort override | Tenant directly edits System row | Draft Industry rename/hide/color/sort of System label |
| --- | --- | --- | --- | --- | --- | --- |
| OVERRIDABLE_LABEL | YES, override only | YES, override only | YES, override only | YES, override only | NO | YES, only with allowIndustryDefaults=true |
| LOCKED_IDENTITY | NO | NO | NO | NO | NO | NO |

These two profiles supply explicit answers for every definition row referencing them; no unspecified default is delegated to implementation. The 22 ordinary label definitions allow create/edit/deactivate and Industry defaults because their approved purpose is customizable labels, not behavior. This includes empty definitions: later additions are permitted, but current excluded fixture rows are not automatically approved.

For `target_metric_type` and `target_type`, the conservative contract closes extensions and presentation overrides: all four flags are false, with LOCKED_IDENTITY. That protects a small stable vocabulary without inventing extensible target calculators or new assignment modes. It does **not** require any Tenant to use those values or implement their domain behavior. The classification permits potential Industry defaults for target_metric_type; this contract intentionally does not exercise that optional capability. Broader customization requires a later explicit contract revision, not a hidden switch. No global runtime enforcement engine is added.

System source never itself means mandatory or required. All persisted rows retain identity and history regardless of source; the retention invariant is different from regulatory or business necessity. No value has a hidden required-for-workflow status. Platform label metadata management must still preserve immutable code/source/ownership and cannot turn replay into an overwrite of edited content. Adding new metric/scope identities requires a reviewed catalog revision; tenant/industry APIs cannot do it.

## Definition contract — exactly 24 rows

Production/default and demo code membership is explicit in the next table; counts below are recomputed from the 86-row candidate table. False/NULL/NONE are deliberate values, not missing decisions.

| code | name | productionDescription | allowTenantCreate | allowTenantEdit | allowTenantDeactivate | allowIndustryDefaults | systemValuePolicy | moduleCode | metadataSchema | systemValueCount | demoOnlyCount | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| designation | Designations | Selectable organization role titles. | true | true | true | true | OVERRIDABLE_LABEL | NULL | NONE | 0 | 0 | Order 1; DEFINITION_ONLY candidate values 4. DEFERRED_MODULE_BINDING: attendance/workforce core is not an exact mapping; role labels confer no authority. |
| contact_role | Contact roles | Selectable roles for business contacts. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 4 | 0 | Order 2; DEFINITION_ONLY candidate values 0. Contact relationships only; not RBAC roles or signing authority. |
| leave_type | Leave types | Selectable leave and duty category labels. | true | true | true | true | OVERRIDABLE_LABEL | attendance | NONE | 0 | 0 | Order 3; DEFINITION_ONLY candidate values 4. Zero System defaults; employer/geography policy supplies applicability, never this lookup. |
| followup_type | Follow-up types | Selectable follow-up interaction categories. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 4 | 0 | Order 4; DEFINITION_ONLY candidate values 0. Labels only; no messaging, scheduling or collection execution. |
| followup_outcome | Follow-up outcomes | Selectable reported outcomes of follow-up interactions. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 4 | 0 | Order 5; DEFINITION_ONLY candidate values 0. Outcome selection does not trigger a workflow. |
| demo_type | Demo types | Selectable product demonstration formats. | true | true | true | true | OVERRIDABLE_LABEL | demo_scheduler | NONE | 3 | 0 | Order 6; DEFINITION_ONLY candidate values 0. No scheduling or provider implementation. |
| task_activity_type | Task and activity types | Selectable task and activity categories. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 3 | 0 | Order 7; DEFINITION_ONLY candidate values 0. No task workflow or sending permission. |
| lead_source | Lead sources | Selectable lead acquisition channels. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 2 | 2 | Order 8; DEFINITION_ONLY candidate values 0. Retain FIELD_VISIT and REFERRAL; synthetic test codes are not production defaults. |
| lost_reason | Lost deal reasons | Selectable reported reasons for a lost opportunity. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 3 | 1 | Order 9; DEFINITION_ONLY candidate values 0. No automatic opportunity transition. |
| visit_type | Visit types | Selectable field visit categories. | true | true | true | true | OVERRIDABLE_LABEL | field_visits | NONE | 3 | 1 | Order 10; DEFINITION_ONLY candidate values 0. No automatic visit or payment action. |
| visit_reason | Visit cancellation reasons | Selectable reported reasons for a cancelled or rescheduled visit. | true | true | true | true | OVERRIDABLE_LABEL | field_visits | NONE | 2 | 2 | Order 11; DEFINITION_ONLY candidate values 0. No cancellation or rescheduling rule. |
| expense_category | Expense categories | Selectable expense classification labels. | true | true | true | true | OVERRIDABLE_LABEL | NULL | NONE | 2 | 1 | Order 12; DEFINITION_ONLY candidate values 0. DEFERRED_MODULE_BINDING: expenses/payroll is ambiguous; labels only, no rates or reimbursement. |
| business_type | Business categories | Selectable business category labels. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 0 | 0 | Order 13; DEFINITION_ONLY candidate values 5. Zero System defaults; independent of Tenant Industry assignment. |
| incentive_type | Incentive types | Selectable incentive or award head labels. | true | true | true | true | OVERRIDABLE_LABEL | payroll | NONE | 0 | 2 | Order 14; DEFINITION_ONLY candidate values 2. Zero System defaults; no compensation eligibility, amount or formula. |
| allowance_type | Allowance types | Selectable allowance head labels. | true | true | true | true | OVERRIDABLE_LABEL | payroll | NONE | 0 | 2 | Order 15; DEFINITION_ONLY candidate values 2. Zero System defaults; no statutory, payment-frequency or rate meaning. |
| deduction_type | Deduction types | Selectable deduction head labels. | true | true | true | true | OVERRIDABLE_LABEL | payroll | NONE | 0 | 1 | Order 16; DEFINITION_ONLY candidate values 3. Zero System defaults; no statutory calculation or employment penalty. |
| skill_set | Skills | Selectable skill labels. | true | true | true | true | OVERRIDABLE_LABEL | NULL | NONE | 0 | 0 | Order 17; DEFINITION_ONLY candidate values 3. DEFERRED_MODULE_BINDING: workforce/core CRM is ambiguous; labels are not qualifications or access grants. |
| document_type | Document types | Selectable document category labels. | true | true | true | true | OVERRIDABLE_LABEL | NULL | NONE | 0 | 0 | Order 18; DEFINITION_ONLY candidate values 3. DEFERRED_MODULE_BINDING: workforce is not canonical; no requirement, verification or expiry behavior. |
| deal_priority | Deal priorities | Selectable priority labels for opportunities. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 3 | 0 | Order 19; DEFINITION_ONLY candidate values 0. Priority labels do not imply response times, SLAs or alerts. |
| competitor_brand | Competitor brands | Selectable competitor brand labels. | true | true | true | true | OVERRIDABLE_LABEL | core_crm | NONE | 0 | 0 | Order 20; DEFINITION_ONLY candidate values 3. Zero System defaults; Industry or Tenant chooses applicable competitors. |
| demo_failure_reason | Demo failure reasons | Selectable reported reasons a demonstration could not proceed. | true | true | true | true | OVERRIDABLE_LABEL | demo_scheduler | NONE | 3 | 0 | Order 21; DEFINITION_ONLY candidate values 0. Reported labels only; no sign-off or equipment policy. |
| visit_objective | Visit objectives | Selectable objectives for a field visit. | true | true | true | true | OVERRIDABLE_LABEL | field_visits | NONE | 3 | 0 | Order 22; DEFINITION_ONLY candidate values 0. No KYC requirement or required evidence checklist. |
| target_metric_type | Target metric types | Selectable stable metric labels without calculation semantics. | false | false | false | false | LOCKED_IDENTITY | NULL | NONE | 2 | 1 | Order 23; DEFINITION_ONLY candidate values 0. DEFERRED_MODULE_BINDING: targets/reporting is not canonical. Closed label catalog for this contract; Industry extension disabled conservatively, not a change to classification. Aggregation deferred. |
| target_type | Target scope types | Selectable stable target assignment-scope labels. | false | false | false | false | LOCKED_IDENTITY | NULL | NONE | 3 | 0 | Order 24; DEFINITION_ONLY candidate values 0. DEFERRED_MODULE_BINDING: targets is not canonical. Closed scope catalog; does not implement Team/Territory/individual assignment. |

## Exact value membership per definition

NONE means an intentionally empty set, not a fallback or an unreviewed candidate. Definition-only candidates reserve no production value row and no implicit owner.

| definitionCode | PRODUCTION_SYSTEM codes | DEFINITION_ONLY candidate codes (not seeded) | DEMO_ONLY codes |
| --- | --- | --- | --- |
| designation | NONE | FIELD_EXEC, SR_SALES_EXEC, TEAM_LEAD, REGIONAL_MGR | NONE |
| contact_role | OWNER, MANAGER, OPS_HEAD, FINANCE | NONE | NONE |
| leave_type | NONE | CASUAL_LEAVE, SICK_LEAVE, EARNED_LEAVE, ON_DUTY | NONE |
| followup_type | QUOTE_FOLLOWUP, DEMO_FOLLOWUP, INFO_FOLLOWUP, PAYMENT_FOLLOWUP | NONE | NONE |
| followup_outcome | SEND_QUOTE, DEMO_REQ, RESCHEDULED, NOT_REACHABLE | NONE | NONE |
| demo_type | WALKTHROUGH, ONSITE_POC, VIRTUAL_DEMO | NONE | NONE |
| task_activity_type | SITE_VISIT, PHONE_CALL, BROADCAST | NONE | NONE |
| lead_source | FIELD_VISIT, REFERRAL | NONE | DIGITAL_ADS, EXPO |
| lost_reason | HIGH_PRICE, COMPETITOR, UNRESPONSIVE | NONE | FEATURE_GAP |
| visit_type | SALES_PITCH, FOLLOW_UP, COLLECTION | NONE | ONBOARDING |
| visit_reason | OWNER_BUSY, CLIENT_RESCHEDULE | NONE | WEATHER, STORE_CLOSED |
| expense_category | FUEL, CLIENT_MEET | NONE | TOLL_PARKING |
| business_type | NONE | GYM_FITNESS, FOOD_BEV, RETAIL_SUPER, SALON_BEAUTY, HEALTHCARE | NONE |
| incentive_type | NONE | CLOSED_WON_COMM, HIGH_VAL_BONUS | CONV_BONUS, QTR_CHAMP |
| allowance_type | NONE | HRA, CONVEYANCE | FUEL_REIMB, MOBILE_DATA |
| deduction_type | NONE | PF, TDS, PT | LOP_PENALTY |
| skill_set | NONE | SAAS_SALES, POS_SETUP, PAY_RECOVERY | NONE |
| document_type | NONE | AADHAAR, PAN_CARD, DRIVING_LIC | NONE |
| deal_priority | P0_URGENT, P1_HIGH, P2_NORMAL | NONE | NONE |
| competitor_brand | NONE | PETPOOJA, DOTPE, VYAPAR | NONE |
| demo_failure_reason | NET_OFFLINE, OWNER_ABSENT, HW_INCOMPAT | NONE | NONE |
| visit_objective | FIRST_PITCH, ONSITE_DEMO, ONBOARDING | NONE | NONE |
| target_metric_type | VISITS_COUNT, DEMOS_COUNT | NONE | REVENUE_INR |
| target_type | TEAM_SCOPE, INDIVIDUAL_SCOPE, TERRITORY_SCOPE | NONE | NONE |

## Module binding review

Canonical registry codes inspected: `core_crm`, `field_visits`, `attendance`, `payroll`, `demo_scheduler`, `order_management`, `whatsapp_automation`, `ai_copilot`. The 18 non-NULL definition bindings above are exact, unambiguous references to this registry. No alias, new Module or guessed substitute is introduced.

| Definition | Documented dependency | moduleCode | Decision and safety boundary |
| --- | --- | --- | --- |
| designation | attendance/workforce core | NULL | DEFERRED_MODULE_BINDING; label only, no role, hierarchy or attendance operations |
| expense_category | expenses/payroll | NULL | DEFERRED_MODULE_BINDING; expense label only, no reimbursement execution |
| skill_set | workforce/core CRM | NULL | DEFERRED_MODULE_BINDING; skill label only, no qualification/access grant |
| document_type | workforce | NULL | DEFERRED_MODULE_BINDING; category only, no compliance or document-processing authority |
| target_metric_type | targets/reporting | NULL | DEFERRED_MODULE_BINDING; closed metric labels, no calculator or aggregation |
| target_type | targets | NULL | DEFERRED_MODULE_BINDING; closed scope labels, no domain assignment |

All six can safely exist as lookup configuration under ordinary tenant authorization without the missing domain Module. NULL means no Module-specific lookup filter yet, **not** entitlement to any related domain endpoint, and it does not bypass selected membership, RBAC or frozen subscription-state checks. No source Module dependency is silently converted into a commercial grant. Binding review is required when the missing domain is actually authorized.

Where moduleCode is set, lookup availability must follow Subscription -> pinned PlanVersion -> PlanModule -> eligible canonical Module, not Industry recommendations or frontend module keys. Phase 0.9 runtime configuration is not needed or authorized by this contract.

## Candidate value contract — exactly 86 rows

Column definitions: `ruleBearingContentFound` identifies original wording that asserts an entitlement, obligation, threshold, calculation, workflow state/requirement or domain aggregation predicate. Ordinary labels, responsibilities and reported reasons are not automatically rules. `sanitizationRequired` is YES when the proposed description or display name differs; it includes neutralization of sector-specific text, not just removal of rules. Counts for rule-bearing removals are separated from all editorial description changes below.

Every original field is copied from the frozen fixture literal; every disposition/reason and proposed text is a review decision. Candidate identity is the pair (definitionCode, valueCode); ONBOARDING in two different definitions is not a duplicate.

| definitionCode | valueCode | currentName | currentDescription | currentIsSystemDefault | proposedName | proposedDescription | disposition | ruleBearingContentFound | sanitizationRequired | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| designation | FIELD_EXEC | Field Executive | Primary field operations and client site executive. | true | Field Executive | Field operations role. | DEFINITION_ONLY | NO | YES | Organization-specific title; definition ships empty. |
| designation | SR_SALES_EXEC | Senior Sales Executive | Senior field sales representative managing high-value leads. | true | Senior Sales Executive | Senior sales role. | DEFINITION_ONLY | NO | YES | Organization-specific seniority; definition ships empty. |
| designation | TEAM_LEAD | Team Leader | Manages field team cluster performance and task allocation. | true | Team Leader | Team leadership role. | DEFINITION_ONLY | NO | YES | Remove allocation responsibilities; title grants no authority. |
| designation | REGIONAL_MGR | Regional Sales Manager | Oversees multi-zone territories and overall revenue targets. | true | Regional Sales Manager | Regional sales management role. | DEFINITION_ONLY | NO | YES | Organization-specific hierarchy; no territory or target authority. |
| contact_role | OWNER | Owner / Proprietor | Primary business owner or partner with signing authority. | true | Owner / Proprietor | Business owner or proprietor contact role. | PRODUCTION_SYSTEM | YES | YES | Reusable contact relationship; remove implied signing authority. |
| contact_role | MANAGER | Store Manager | Day-to-day store manager handling operations. | true | Store Manager | Store management contact role. | PRODUCTION_SYSTEM | NO | YES | Reusable contact label; no operational or permission grant. |
| contact_role | OPS_HEAD | Operations Head | Oversees logistics, inventory, and field rep visits. | true | Operations Head | Operations leadership contact role. | PRODUCTION_SYSTEM | NO | YES | Reusable contact label; no assigned duties. |
| contact_role | FINANCE | Accountant / Finance | Handles billing, invoices, and payment collection. | true | Accountant / Finance | Accounting or finance contact role. | PRODUCTION_SYSTEM | NO | YES | Reusable contact label; no billing or payment authority. |
| leave_type | CASUAL_LEAVE | Casual Leave (CL) | Short duration casual paid leave allotment. | true | Casual Leave (CL) | Casual leave category. | DEFINITION_ONLY | YES | YES | Leave entitlement is organization/geography-specific; remove paid allotment. |
| leave_type | SICK_LEAVE | Sick Leave (SL) | Medical and health related absence allowance. | true | Sick Leave (SL) | Sick leave category. | DEFINITION_ONLY | YES | YES | Leave allowances belong to separately approved policy. |
| leave_type | EARNED_LEAVE | Earned / Privilege Leave (EL) | Accumulated paid annual leave allowance. | true | Earned / Privilege Leave (EL) | Earned or privilege leave category. | DEFINITION_ONLY | YES | YES | Remove accumulated paid annual entitlement. |
| leave_type | ON_DUTY | Official Outstation Duty (OD) | Approved field duty or outstation market survey. | true | Official Outstation Duty (OD) | Official outstation duty category. | DEFINITION_ONLY | YES | YES | Remove approval assumption; no automatic absence treatment. |
| followup_type | QUOTE_FOLLOWUP | Quotation Follow-up | Commercial pricing and proposal review follow-up. | true | Quotation Follow-up | Follow-up concerning a quotation. | PRODUCTION_SYSTEM | NO | YES | Generic interaction label; no pricing rules. |
| followup_type | DEMO_FOLLOWUP | Demo Follow-up | Post product demo feedback and technical query resolution. | true | Demo Follow-up | Follow-up concerning a product demonstration. | PRODUCTION_SYSTEM | NO | YES | Generic interaction label; no execution requirement. |
| followup_type | INFO_FOLLOWUP | Product Info Follow-up | Share product brochure, case studies and features. | true | Product Info Follow-up | Follow-up concerning product information. | PRODUCTION_SYSTEM | NO | YES | Describes interaction instead of directing content delivery. |
| followup_type | PAYMENT_FOLLOWUP | Payment Follow-up | Collection and invoice payment follow-up. | true | Payment Follow-up | Follow-up concerning a payment. | PRODUCTION_SYSTEM | NO | YES | Labels an interaction; no collection or billing action. |
| followup_outcome | SEND_QUOTE | Interested - Send Quote | Merchant showed high interest, requested detailed quote. | true | Interested - Send Quote | A quotation was requested. | PRODUCTION_SYSTEM | NO | YES | Reported outcome only; does not send a quotation. |
| followup_outcome | DEMO_REQ | Product Demo Requested | Scheduled onsite live product demo session. | true | Product Demo Requested | A product demonstration was requested. | PRODUCTION_SYSTEM | YES | YES | Remove scheduled-session assertion from a request outcome. |
| followup_outcome | RESCHEDULED | Call Rescheduled | Owner was busy, asked to call back later. | true | Call Rescheduled | A call was rescheduled. | PRODUCTION_SYSTEM | NO | YES | Reported outcome only; no calendar mutation. |
| followup_outcome | NOT_REACHABLE | Not Reachable | Phone went unanswered after 3 attempts. | true | Not Reachable | Contact could not be reached. | PRODUCTION_SYSTEM | YES | YES | Remove three-attempt threshold. |
| demo_type | WALKTHROUGH | Product Walkthrough | Standard software feature demonstration. | true | Product Walkthrough | Standard software feature demonstration. | PRODUCTION_SYSTEM | NO | NO | Safe demonstration label; unchanged. |
| demo_type | ONSITE_POC | Onsite Live POC | Onsite setup and live pilot demonstration. | true | Onsite Live POC | Onsite setup and live pilot demonstration. | PRODUCTION_SYSTEM | NO | NO | Safe demonstration label; unchanged. |
| demo_type | VIRTUAL_DEMO | Virtual Video Demo | Online screen share presentation via Google Meet / Zoom. | true | Virtual Video Demo | Demonstration over a video call. | PRODUCTION_SYSTEM | NO | YES | Remove vendor-specific meeting examples. |
| task_activity_type | SITE_VISIT | In-Person Site Visit | Physical store visit and merchant consultation. | true | In-Person Site Visit | In-person site visit activity. | PRODUCTION_SYSTEM | NO | YES | Generic activity label; no visit execution. |
| task_activity_type | PHONE_CALL | Outbound Phone Call | Telephonic check-in or follow-up call. | true | Outbound Phone Call | Outbound telephone call activity. | PRODUCTION_SYSTEM | NO | YES | Generic activity label; no call execution. |
| task_activity_type | BROADCAST | WhatsApp / Email Broadcast | Digital collateral or proposal shared via chat/email. | true | WhatsApp / Email Broadcast | Messaging or email broadcast activity. | PRODUCTION_SYSTEM | NO | YES | Communication label, not consent or provider-send authorization. |
| lead_source | FIELD_VISIT | Direct Field Visit | Executive walk-in or cold visit. | true | Direct Field Visit | Lead originating from a field visit. | PRODUCTION_SYSTEM | NO | YES | Generic acquisition channel; original code retained. |
| lead_source | REFERRAL | Partner / Referral | Existing client or broker referral. | true | Partner / Referral | Lead originating from a referral. | PRODUCTION_SYSTEM | NO | YES | Generic acquisition channel; no referral payout rule. |
| lead_source | DIGITAL_ADS | Digital Ad Campaign | Google / Meta inbound campaign. | false | Digital Ad Campaign | Lead originating from a digital advertising campaign. | DEMO_ONLY | NO | YES | Custom fixture; no explicit global-default approval. |
| lead_source | EXPO | Industry Expo | Trade show and expo inquiries. | false | Industry Expo | Trade show and expo inquiries. | DEMO_ONLY | NO | NO | Custom fixture; retain demo description, no global import. |
| lost_reason | HIGH_PRICE | Price / Budget Constraint | Merchant found pricing higher than budget. | true | Price / Budget Constraint | Price or budget was the reported concern. | PRODUCTION_SYSTEM | NO | YES | Selectable reported reason, not a price threshold. |
| lost_reason | COMPETITOR | Competitor Selected | Client chose alternative SaaS provider. | true | Competitor Selected | An alternative provider was selected. | PRODUCTION_SYSTEM | NO | YES | Remove SaaS-specific restriction. |
| lost_reason | UNRESPONSIVE | Unresponsive Merchant | No response after multiple follow-ups. | true | Unresponsive Merchant | Contact was unresponsive. | PRODUCTION_SYSTEM | YES | YES | Remove follow-up-count precondition. |
| lost_reason | FEATURE_GAP | Feature Gap | Specific required feature not supported. | false | Feature Gap | A requested feature was unavailable. | DEMO_ONLY | NO | YES | Custom fixture; no explicit global-default approval. |
| visit_type | SALES_PITCH | Sales Pitch & Demo | In-person AI product demo for store owner. | true | Sales Pitch & Demo | Visit for a sales presentation or demonstration. | PRODUCTION_SYSTEM | NO | YES | Remove AI/store restriction; reusable visit label. |
| visit_type | FOLLOW_UP | Follow-up Consultation | Follow-up meeting to address commercial terms. | true | Follow-up Consultation | Visit for a follow-up consultation. | PRODUCTION_SYSTEM | NO | YES | Reusable visit label; no prescribed commercial process. |
| visit_type | COLLECTION | Payment Collection | Cheque or digital payment collection visit. | true | Payment Collection | Visit concerning payment collection. | PRODUCTION_SYSTEM | NO | YES | Reusable visit label; not payment authorization. |
| visit_type | ONBOARDING | Onboarding & Training | Staff training and software installation. | false | Onboarding & Training | Staff training and software installation. | DEMO_ONLY | NO | NO | Custom fixture; unchanged demo description. |
| visit_reason | OWNER_BUSY | Merchant Owner Unavailable | Store decision maker was out of town or busy. | true | Merchant Owner Unavailable | The merchant owner was unavailable. | PRODUCTION_SYSTEM | NO | YES | Reported visit reason; no rescheduling rule. |
| visit_reason | CLIENT_RESCHEDULE | Rescheduled by Client | Client requested postponement to later date. | true | Rescheduled by Client | The client requested rescheduling. | PRODUCTION_SYSTEM | NO | YES | Reported reason; no automatic scheduling. |
| visit_reason | WEATHER | Weather / Heavy Rain | Severe weather or flooded roads in zone. | false | Weather / Heavy Rain | Severe weather or flooded roads in zone. | DEMO_ONLY | NO | NO | Custom fixture; unchanged demo description. |
| visit_reason | STORE_CLOSED | Store Closed / Holiday | Retail establishment closed on visit day. | false | Store Closed / Holiday | Retail establishment closed on visit day. | DEMO_ONLY | NO | NO | Custom fixture; unchanged demo description. |
| expense_category | FUEL | Fuel & Commute | Field travel fuel expenses. | true | Fuel & Commute | Field travel fuel expenses. | PRODUCTION_SYSTEM | NO | NO | Generic expense head; no reimbursement rate or eligibility. |
| expense_category | CLIENT_MEET | Client Lunch & Hospitality | Prospect meeting expenses. | true | Client Lunch & Hospitality | Client meeting or hospitality expenses. | PRODUCTION_SYSTEM | NO | YES | Generic expense head; no spending approval or limit. |
| expense_category | TOLL_PARKING | Toll & Parking Fees | Highway tolls and commercial parking. | false | Toll & Parking Fees | Highway tolls and commercial parking. | DEMO_ONLY | NO | NO | Custom fixture; unchanged demo description. |
| business_type | GYM_FITNESS | Gym & Fitness Center | Gyms, yoga studios, and fitness centers. | true | Gym & Fitness Center | Gyms, yoga studios, and fitness centers. | DEFINITION_ONLY | NO | NO | Sector selection belongs to Industry or Tenant; no global defaults. |
| business_type | FOOD_BEV | Food & Beverage | Cafes, restaurants, and bakeries. | true | Food & Beverage | Cafes, restaurants, and bakeries. | DEFINITION_ONLY | NO | NO | Sector selection belongs to Industry or Tenant; no global defaults. |
| business_type | RETAIL_SUPER | Retail Supermarket | Grocery stores and supermarket chains. | true | Retail Supermarket | Grocery stores and supermarket chains. | DEFINITION_ONLY | NO | NO | Sector selection belongs to Industry or Tenant; no global defaults. |
| business_type | SALON_BEAUTY | Beauty & Wellness Salon | Salons, spas, and skincare clinics. | true | Beauty & Wellness Salon | Salons, spas, and skincare clinics. | DEFINITION_ONLY | NO | NO | Sector selection belongs to Industry or Tenant; no global defaults. |
| business_type | HEALTHCARE | Healthcare & Clinic | Polyclinics and diagnostic centers. | true | Healthcare & Clinic | Polyclinics and diagnostic centers. | DEFINITION_ONLY | NO | NO | Sector selection belongs to Industry or Tenant; no global defaults. |
| incentive_type | CLOSED_WON_COMM | Closed Won Deal Commission | Percentage commission on closed deals. | true | Closed Won Deal Commission | Closed-deal commission head. | DEFINITION_ONLY | YES | YES | Sales compensation is organization-specific; remove percentage/calculation semantics. |
| incentive_type | HIGH_VAL_BONUS | High Value Closed Won Bonus | Special bonus for deals exceeding threshold value. | true | High Value Closed Won Bonus | High-value deal bonus head. | DEFINITION_ONLY | YES | YES | Type label only; remove threshold eligibility. |
| incentive_type | CONV_BONUS | Lead Conversion Bonus | Flat bonus per qualified lead converted. | false | Lead Conversion Bonus | Lead conversion bonus head. | DEMO_ONLY | YES | YES | Custom compensation fixture; remove flat-per-conversion eligibility. |
| incentive_type | QTR_CHAMP | Quarterly Sales Champion | Quarterly top performer milestone reward. | false | Quarterly Sales Champion | Sales champion award head. | DEMO_ONLY | YES | YES | Custom compensation fixture; remove period and milestone eligibility. |
| allowance_type | HRA | House Rent Allowance (HRA) | Statutory house rent component. | true | House Rent Allowance (HRA) | House rent allowance head. | DEFINITION_ONLY | YES | YES | Geography/employer-specific; remove statutory assertion. |
| allowance_type | CONVEYANCE | Conveyance Allowance | Fixed monthly commute allowance. | true | Conveyance Allowance | Conveyance allowance head. | DEFINITION_ONLY | YES | YES | Employer-specific head; remove fixed monthly calculation. |
| allowance_type | FUEL_REIMB | Field Fuel Reimbursement | Variable per-km fuel reimbursement. | false | Field Fuel Reimbursement | Field fuel reimbursement head. | DEMO_ONLY | YES | YES | Custom compensation fixture; remove variable per-kilometre rule. |
| allowance_type | MOBILE_DATA | Mobile & Data Allowance | Monthly connectivity allowance. | false | Mobile & Data Allowance | Mobile and data allowance head. | DEMO_ONLY | YES | YES | Custom compensation fixture; remove monthly scheduling. |
| deduction_type | PF | Provident Fund (PF) | Statutory Provident Fund employee contribution. | true | Provident Fund (PF) | Provident fund deduction head. | DEFINITION_ONLY | YES | YES | Geography-specific; remove statutory contribution assertion. |
| deduction_type | TDS | TDS / Income Tax | Tax deducted at source based on tax slab. | true | TDS / Income Tax | Income tax deduction head. | DEFINITION_ONLY | YES | YES | Geography-specific; remove tax-slab calculation. |
| deduction_type | PT | Professional Tax (PT) | State professional tax deduction. | true | Professional Tax (PT) | Professional tax deduction head. | DEFINITION_ONLY | YES | YES | Geography-specific; no statutory requirement imported. |
| deduction_type | LOP_PENALTY | Attendance LOP Penalty | Pro-rata deduction for unapproved absences. | true | Attendance LOP Penalty | Loss-of-pay penalty head label. | DEMO_ONLY | YES | YES | CODE_REVIEW_REQUIRED: PENALTY embeds punitive meaning; exclude rather than rename code or infer deductions. |
| skill_set | SAAS_SALES | B2B Enterprise SaaS Sales | High-value multi-store deal negotiation. | true | B2B Enterprise SaaS Sales | Enterprise software sales skill. | DEFINITION_ONLY | NO | YES | Industry/organization-specific skill; no global default. |
| skill_set | POS_SETUP | Retail POS Technical Setup | Onsite hardware and software configuration. | true | Retail POS Technical Setup | Point-of-sale setup skill. | DEFINITION_ONLY | NO | YES | Industry/organization-specific skill; no global default. |
| skill_set | PAY_RECOVERY | Payment Recovery & Audit | Overdue payment collection specialist. | true | Payment Recovery & Audit | Payment recovery and audit skill. | DEFINITION_ONLY | NO | YES | Industry/organization-specific skill; no collection authority. |
| document_type | AADHAAR | Aadhaar Identity Verification | Mandatory Government Identity Card. | true | Aadhaar Identity Verification | Aadhaar document category. | DEFINITION_ONLY | YES | YES | Geography-specific; remove mandatory requirement. |
| document_type | PAN_CARD | PAN Card Copy | Tax ID for salary processing & TDS deduction. | true | PAN Card Copy | PAN document category. | DEFINITION_ONLY | YES | YES | Geography-specific; remove salary/tax-processing purpose from document authority. |
| document_type | DRIVING_LIC | Driving License (Commercial/DL) | Mandatory for two-wheeler field executives. | true | Driving License (Commercial/DL) | Driving licence document category. | DEFINITION_ONLY | YES | YES | Jurisdiction-specific document variant; remove role-based mandatory requirement. |
| deal_priority | P0_URGENT | Urgent (P0 - Immediate Action) | High value hot deal closing within 24 hours. | true | Urgent (P0) | Urgent priority. | PRODUCTION_SYSTEM | YES | YES | Remove 24-hour rule and action directive in label; code retained. |
| deal_priority | P1_HIGH | High (P1 - Priority Pitch) | Standard high-intent prospect requiring demo. | true | High (P1) | High priority. | PRODUCTION_SYSTEM | YES | YES | Remove required demo and prescribed pitch from label; code retained. |
| deal_priority | P2_NORMAL | Normal (P2 - Standard Cadence) | Regular lead pipeline progression. | true | Normal (P2) | Normal priority. | PRODUCTION_SYSTEM | NO | YES | Remove cadence/process wording; code retained. |
| competitor_brand | PETPOOJA | Petpooja POS | Restaurant billing and inventory software. | true | Petpooja POS | Restaurant billing and inventory software. | DEFINITION_ONLY | NO | NO | Named sector competitor; no global default or implicit Industry assignment. |
| competitor_brand | DOTPE | DotPe Store Manager | Digital catalog and order management app. | true | DotPe Store Manager | Digital catalog and order management app. | DEFINITION_ONLY | NO | NO | Named sector competitor; no global default or implicit Industry assignment. |
| competitor_brand | VYAPAR | Vyapar Accounting | Small retail billing and GST invoicing app. | true | Vyapar Accounting | Small retail billing and GST invoicing app. | DEFINITION_ONLY | NO | NO | Named sector competitor; no global default or implicit Industry assignment. |
| demo_failure_reason | NET_OFFLINE | Store Internet / Wi-Fi Offline | Demo could not proceed due to poor connectivity. | true | Store Internet / Wi-Fi Offline | Internet or Wi-Fi connectivity was unavailable. | PRODUCTION_SYSTEM | NO | YES | Reported failure reason only; no connectivity policy. |
| demo_failure_reason | OWNER_ABSENT | Key Decision Maker Absent | Only store staff present, owner unavailable for signoff. | true | Key Decision Maker Absent | A key decision maker was absent. | PRODUCTION_SYSTEM | YES | YES | Remove sign-off authority/requirement assumption. |
| demo_failure_reason | HW_INCOMPAT | Hardware Incompatible | Merchant legacy printer or scanner incompatible. | true | Hardware Incompatible | Hardware was incompatible. | PRODUCTION_SYSTEM | NO | YES | Remove retailer-specific hardware examples. |
| visit_objective | FIRST_PITCH | First Prospecting & Pitch | Initial store introduction and need discovery. | true | First Prospecting & Pitch | Initial prospecting and presentation objective. | PRODUCTION_SYSTEM | NO | YES | Objective label only; no prescribed workflow. |
| visit_objective | ONSITE_DEMO | Onsite Product Demonstration | Live feature demo on merchant tablet/desktop. | true | Onsite Product Demonstration | Onsite product demonstration objective. | PRODUCTION_SYSTEM | NO | YES | Objective label only; no device or merchant restriction. |
| visit_objective | ONBOARDING | Contract Signing & Onboarding | KYC collection, agreement signature & setup. | true | Contract Signing & Onboarding | Contract signing and onboarding objective. | PRODUCTION_SYSTEM | YES | YES | Remove KYC/evidence checklist; labels do not require document collection. |
| target_metric_type | REVENUE_INR | Gross Revenue Sales (₹) | Total closed won subscription & hardware revenue. | true | Gross Revenue Sales (₹) | Indian-rupee revenue metric label. | DEMO_ONLY | YES | YES | Currency-specific fixture; remove revenue aggregation scope; no global INR default. |
| target_metric_type | VISITS_COUNT | Completed Field Visits | Total verified store check-in visits completed. | true | Completed Field Visits | Field-visit count metric label. | PRODUCTION_SYSTEM | YES | YES | Stable identity only; remove verified-store/check-in aggregation predicate. |
| target_metric_type | DEMOS_COUNT | Demos Delivered | Successful product walkthroughs conducted. | true | Demos Delivered | Demonstration count metric label. | PRODUCTION_SYSTEM | YES | YES | Stable identity only; remove success-based aggregation predicate. |
| target_type | TEAM_SCOPE | Team Target Cluster | Target assigned to entire sales team / branch unit. | true | Team Target Cluster | Team-level target scope label. | PRODUCTION_SYSTEM | NO | YES | Fixed scope identity only; no Team assignment implementation. |
| target_type | INDIVIDUAL_SCOPE | Individual Executive Quota | Target assigned to single field executive. | true | Individual Executive Quota | Individual-level target scope label. | PRODUCTION_SYSTEM | NO | YES | Fixed scope identity only; no user assignment implementation. |
| target_type | TERRITORY_SCOPE | Territory Zone Target | Geographic zone revenue and visit target. | true | Territory Zone Target | Territory-level target scope label. | PRODUCTION_SYSTEM | NO | YES | Fixed scope identity only; no geography or target aggregation. |

## Production presentation manifest — exactly 44 rows

For PRODUCTION_SYSTEM rows only, preserve the fixture color (or explicit NULL), integer sortOrder and active flag below. No value ID from the fixture is imported; backend IDs will be generated by the future implementation. Gaps in order are retained; no ordering or color carries threshold, status or policy meaning. Future effective ordering must use the existing specified deterministic tie-break rules, not insertion order.

All production names/descriptions are from the candidate table's **proposed** columns. Description text does not derive from this manifest or from the raw runtime fixture. No Industry or Tenant value is included.

| definitionCode | valueCode | displayColor | sortOrder | isActive |
| --- | --- | --- | --- | --- |
| contact_role | OWNER | #7C3AED | 1 | true |
| contact_role | MANAGER | #2563EB | 2 | true |
| contact_role | OPS_HEAD | #D97706 | 3 | true |
| contact_role | FINANCE | #059669 | 4 | true |
| followup_type | QUOTE_FOLLOWUP | #7C3AED | 1 | true |
| followup_type | DEMO_FOLLOWUP | #2563EB | 2 | true |
| followup_type | INFO_FOLLOWUP | #059669 | 3 | true |
| followup_type | PAYMENT_FOLLOWUP | #D97706 | 4 | true |
| followup_outcome | SEND_QUOTE | #10B981 | 1 | true |
| followup_outcome | DEMO_REQ | #3B82F6 | 2 | true |
| followup_outcome | RESCHEDULED | #F59E0B | 3 | true |
| followup_outcome | NOT_REACHABLE | #EF4444 | 4 | true |
| demo_type | WALKTHROUGH | #2563EB | 1 | true |
| demo_type | ONSITE_POC | #7C3AED | 2 | true |
| demo_type | VIRTUAL_DEMO | #059669 | 3 | true |
| task_activity_type | SITE_VISIT | #2563EB | 1 | true |
| task_activity_type | PHONE_CALL | #059669 | 2 | true |
| task_activity_type | BROADCAST | #D97706 | 3 | true |
| lead_source | FIELD_VISIT | NULL | 1 | true |
| lead_source | REFERRAL | NULL | 2 | true |
| lost_reason | HIGH_PRICE | NULL | 1 | true |
| lost_reason | COMPETITOR | NULL | 2 | true |
| lost_reason | UNRESPONSIVE | NULL | 3 | true |
| visit_type | SALES_PITCH | #2563EB | 1 | true |
| visit_type | FOLLOW_UP | #F59E0B | 2 | true |
| visit_type | COLLECTION | #10B981 | 3 | true |
| visit_reason | OWNER_BUSY | NULL | 1 | true |
| visit_reason | CLIENT_RESCHEDULE | NULL | 2 | true |
| expense_category | FUEL | NULL | 1 | true |
| expense_category | CLIENT_MEET | NULL | 3 | true |
| deal_priority | P0_URGENT | #DC2626 | 1 | true |
| deal_priority | P1_HIGH | #D97706 | 2 | true |
| deal_priority | P2_NORMAL | #2563EB | 3 | true |
| demo_failure_reason | NET_OFFLINE | #DC2626 | 1 | true |
| demo_failure_reason | OWNER_ABSENT | #D97706 | 2 | true |
| demo_failure_reason | HW_INCOMPAT | #6B7280 | 3 | true |
| visit_objective | FIRST_PITCH | #2563EB | 1 | true |
| visit_objective | ONSITE_DEMO | #7C3AED | 2 | true |
| visit_objective | ONBOARDING | #059669 | 3 | true |
| target_metric_type | VISITS_COUNT | #2563EB | 2 | true |
| target_metric_type | DEMOS_COUNT | #7C3AED | 3 | true |
| target_type | TEAM_SCOPE | #7C3AED | 1 | true |
| target_type | INDIVIDUAL_SCOPE | #2563EB | 2 | true |
| target_type | TERRITORY_SCOPE | #059669 | 3 | true |

## Code and product review ledger

| Review | Candidate/scope | Disposition | Exact decision | Effect on this contract |
| --- | --- | --- | --- | --- |
| CODE_REVIEW_REQUIRED | deduction_type / LOP_PENALTY | DEMO_ONLY | PENALTY asserts punitive meaning beyond a neutral loss-of-pay head. Retain original code only as historical/demo evidence; do not silently rename it to LOP or LOSS_OF_PAY. Reuse in a later production contract requires explicit code/meaning review. | Non-gating for the proposed production seed because the row is excluded; zero unresolved production codes |
| Currency-specific metric | target_metric_type / REVENUE_INR | DEMO_ONLY | INR is an explicit unit, not a rate or formula; keep its code, but do not infer global geography/currency approval or rename it to generic revenue. | No code review needed for historical identity; production inclusion would require a separate reviewed revision |
| Sector/geography/organization values | Nine zero-System categories | DEFINITION_ONLY or DEMO_ONLY as listed | Prefer empty System sets over global product assumptions. Later authorized Industry/Tenant creation uses neutral labels and does not infer policy applicability. | No additional product exception is needed to ship these definitions empty |
| Closed target catalogs | target_metric_type / target_type | Five PRODUCTION_SYSTEM values | Stable identities only; no custom metrics, new scope types or Industry additions in this contract. | Safe restrictive proposal; expanding it later needs explicit review |
| PRODUCT_APPROVAL_REQUIRED exceptions | NONE | Not applicable | No unresolved business choice is required for the proposed small seed. Unsafe/insufficiently approved candidates are excluded, not marked PENDING. | Count 0 additional exceptions; owner approval of the entire proposed contract is still mandatory |

Thus there is one historical/demo code-review item and zero blocking production code reviews. READY FOR OWNER APPROVAL does not resolve that excluded item's meaning or authorize its import. It means the proposed production subset and all exclusions are fully decided and reviewable.

## Implementation handoff after owner approval — not executed

The owner must explicitly approve revision 1 of this document (including exclusions, 24 policies, presentation manifest and the closed target catalogs) before M8/backend work starts. No approval is inferred from this task's authorization to prepare the contract.

The later canonical backend seed artifact must contain exactly these 24 definitions and 44 proposed SYSTEM values, with source-snapshot provenance and a normalized reviewed-payload hash. It must not import the web module at runtime. Definition-only and demo candidates contribute zero production value rows. Production INDUSTRY/TENANT seed sets are empty. Test-only v1/v2 data such as INBOUND/FIELD_PROSPECTING remains isolated test data, not a substitute for retained production lead-source codes.

Seed review/apply must remain explicit: missing approved entries may be created, identical rows are NOOP, material conflicts fail/report, and replay must not overwrite platform-admin edits. Do not auto-create unknown definitions, rename stable codes, map legacy MasterRecord ownership, choose a Plan, publish Industry content or grant Modules. Seed import is not a production reconciliation shortcut. Applied history and frozen M7 JSON remain untouched.

Reuse: the approved classification and real fixture identities, canonical registry, and existing architecture boundaries. Added: this separate documentation contract only. Backend/API/schema/migration/RBAC changes: NONE. Trade-off: a smaller production default set intentionally leaves nine categories empty and all custom/unsafe candidates excluded; future authorized additions can supply context-specific labels without rewriting the engine.

## Validation performed

Read-only reconciliation checks:

- Exactly 44 source categories and 24 A identities; no excluded category in the definition table.
- Exactly 86 candidate rows; unique (definitionCode, valueCode); original name/description/system flag matches the frozen source.
- Exactly one allowed disposition per candidate, with no UNKNOWN/PENDING/UNCLASSIFIED candidate.
- All 11 custom-flagged candidates are DEMO_ONLY.
- All 24 definition policies and all System override actions have explicit values.
- Definition counts, exact membership lists and the 44-row presentation manifest agree with candidate dispositions.
- Every non-NULL Module binding is canonical; exactly six NULL bindings explicitly deferred.
- All proposed System codes are unchanged; all 30 identified rule-bearing descriptions have neutral proposed text, including 10 in the production subset.
- Existing tracked files and the two earlier uncommitted audit documents remain unchanged.

This is contract/source validation, not Prisma validation, a seed dry-run, runtime tests, database integrity proof or CI certification. No build, migration, seed or application test was run for a documentation-only change.

## Summary counts

| Measure | Count |
| --- | --- |
| Fixture categories | 44 |
| Generic definitions | 24 |
| Non-Generic categories | 20 |
| Generic candidate values found / reviewed | 86 / 86 |
| PRODUCTION_SYSTEM values | 44 |
| DEFINITION_ONLY definitions (zero System rows) | 9 |
| DEFINITION_ONLY candidate values (not persisted) | 29 |
| DEMO_ONLY values | 13 |
| Sanitized descriptions (proposed changes across all candidates) | 70 |
| Rule-bearing descriptions found | 30 |
| Rule-bearing descriptions sanitized in proposed text | 30 |
| Rule-bearing descriptions sanitized in production subset | 10 |
| Explicitly neutralized display names | 3 |
| Stable codes renamed | 0 |
| CODE_REVIEW_REQUIRED | 1 (demo-only; 0 production blockers) |
| PRODUCT_APPROVAL_REQUIRED additional exceptions | 0 |
| Ambiguous Module mappings / DEFERRED_MODULE_BINDING | 6 |
| Unclassified candidates | 0 |
| Seeded definitions / values in this task | 0 / 0 |

## Final contract decision

PHASE 0.8 MASTER SEED CONTRACT REVIEW

Definitions reviewed: 24.
Values reviewed: 86.

Production System values: 44 proposed, none seeded.
Definition-only categories: 9.
Demo-only values: 13.

Rule-bearing descriptions found: 30.
Rule-bearing descriptions sanitized: 30 in this proposed contract, not the frontend fixture.

Code reviews required: 1, DEMO_ONLY and excluded from production.
Product approvals required: 0 additional unresolved exceptions; explicit owner approval of this contract remains required.
Module mappings deferred: 6.

Unclassified: 0.

FINAL CONTRACT STATUS: **READY FOR OWNER APPROVAL**.

**STOP. Do not begin M8 or backend implementation until the owner explicitly approves this contract. Do not start Phase 0.9.**
