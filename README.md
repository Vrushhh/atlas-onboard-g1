# Atlas Onboard

**Turn a new plant’s existing exports into reviewed operating reports, while full integration continues.**

Atlas Onboard is an interactive product prototype for the **“Slow Onboarding of New Plants” case, submitted against the G1 requirements**. It connects a business problem—leadership waiting too long for comparable plant information—to a practical workflow: upload, interpret, check, approve, report and act.

[**Open the live MVP**](https://atlas-onboard-six.vercel.app/) · [Source repository](https://github.com/Vrushhh/atlas-onboard-g1) · [Explore the Figma workflow](https://www.figma.com/design/YxgmWVqyBo10N08aSBc8D9) · [Golden dataset](golden/README.md) · [Original design seed](design-seed-v1/README.md) · [Dataset provenance](golden/DATA_CARD.md)

## The case in plain language

Atlas Fabrication Works has expanded from four to eleven plants over six years, with two more acquisitions expected. Each site brings different equipment, systems and local practices. A nine-person central IT/operations team integrates the new plants.

The supplied case says the last three onboardings averaged **seven months** before leadership received reliable, comparable operating data, costing approximately **USD 1.2 million per plant**. During onboarding, local spreadsheets do not roll into group reporting. Two of the last five acquired plants were later found to be below the production assumptions used at acquisition.

This creates a management blind spot: the company owns a plant before it can consistently see how that plant is performing. Seven months describes the reporting/integration gap; it does **not** mean the plant stopped producing. Two underperforming acquisitions out of five is a historical observation, not a prediction.

All company facts above come from the supplied case. This project is an independent case-study submission; it does not claim an affiliation with a real Atlas company. Seeded plants, people, records and benchmarks are synthetic.

## Root-cause hypotheses to validate

The observed failure is repeated, slow onboarding and late comparable visibility. Likely contributors are inconsistent definitions, repeated integration work, unclear acceptance ownership and constrained central capacity. The case does not establish their relative contribution. Access delays, vendor dependencies, data defects and approval queues may explain as much elapsed time as technical mapping.

Discovery must distinguish **waiting time from active work**, **allocated expense from avoidable cash cost**, and **earlier reporting from an earlier effective decision**. The product focuses on interpretation, acceptance and reporting reuse; it cannot by itself remove acquisition access restrictions, hardware changes or every integration bottleneck.

## Market context and regulatory scope

Our initial customer segment is a manufacturer acquiring or building sites with different operating systems. The economic sponsor is group operations/integration leadership; the primary users are central engineers, plant specialists and data stewards. This is a segment and buyer hypothesis inferred from the supplied case, not a verified market-size estimate.

The practical alternatives are continued spreadsheet consolidation, a full ERP/MES integration project, an incumbent integration/BI platform or a reporting bridge with evidence-based acceptance. Atlas Onboard focuses on the interval before full integration: reuse existing exports and existing enterprise platforms, while standardizing meaning and accountability. An existing platform that already handles these needs may be the better implementation vehicle. We claim no unique market position or quantified external demand.

Manufacturing interoperability includes the meaning of data as well as its transport. [NIST's semantic-integration research](https://www.nist.gov/publications/standards-based-semantic-integration-manufacturing-information-past-present-and-future) and [ISA-95 enterprise/control integration](https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard) provide relevant context; this prototype does not claim standards certification.

Atlas's countries, contracts, personal-data categories and regulated activities are unknown. Legal/Security must assess applicability before a real pilot:

| Trigger to verify | Decision / guardrail | Owner |
| --- | --- | --- |
| Exports include operator names, IDs or identifiable shift patterns | Use aggregated plant/shift data where possible; define purpose, lawful processing, access and retention under applicable privacy law | Privacy/Legal and plant owner |
| Data or providers cross jurisdictions | Confirm source rights, processing region, transfer conditions and provider terms | Legal, Security and procurement |
| EU-related processing or deployment | Assess GDPR and AI Act applicability to the actual data and use case; do not assume a classification or a compliance certification | Legal and AI governance |
| Software touches OT networks or safety-related decisions | Approve read-only extraction and maintain plant safety boundaries; prohibit machine/control writes in the pilot | OT/security owner |
| Customer, acquisition or vendor restrictions limit data sharing | Obtain export/model-processing rights and choose allowed hosting/retention | Legal and source owner |

Where GDPR applies, purpose limitation and data minimization are relevant principles. The EU AI Act uses a risk-based approach, and worker-management uses require separate scrutiny. Our proposed scope excludes individual worker evaluation and autonomous control; any scope change triggers reassessment. [European Commission privacy principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en), [EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).

OT safety and business continuity guide the extraction design. [CISA and partner OT guidance](https://www.cisa.gov/news-events/alerts/2024/10/01/asds-acsc-cisa-fbi-nsa-and-international-partners-release-guidance-principles-ot-cybersecurity) and the voluntary [NIST AI RMF](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10) inform our control design. Guidance is not proof of legal compliance. Sources checked 27 October 2026.

## Our product decision

**Provide earlier, scoped reporting from authorized exports instead of making leadership wait for every enterprise integration to finish.**

The MVP is a reporting bridge. It standardizes the meaning of selected fields, checks the numbers, requires accountable human acceptance and makes deviations actionable. It does not replace ERP, MES, historians or industrial control systems.

| Pain point | Product response | Intended business value |
| --- | --- | --- |
| Different names, units and definitions | Explicit field mappings with definitions, evidence and allowed conversions | Less repeated interpretation and fewer misleading comparisons |
| Unreliable or incomplete exports | Fourteen deterministic checks that block acceptance | Catch errors before they reach management reports |
| Unclear ownership of trustworthy data | Separate plant-operations and data-steward reviews | Accountable acceptance of the exact source and mapping version |
| Every plant starts from scratch | Reusable templates that still require local evidence | Reuse knowledge without assuming two sites are identical |
| Late discovery of performance gaps | Scoped benchmarks and owned investigations | Connect a signal to a person, action and finding |
| Integration team capacity pressure | Visible workflow and active-effort logging | Establish a measurable baseline for reducing repeat work |

These are intended benefits. Real savings, shorter onboarding and better operating outcomes require a representative pilot.

## Try the product in five minutes

1. Start with **Riverside works** to inspect a pre-approved synthetic report and its source coverage.
2. Select **North works** for the full journey. Confirm access, reviewers and reporting definitions in **Plant setup**.
3. Inspect **Source data**, upload a UTF-8 CSV or load the supplied error sample.
4. Open **Mapping review**. Review documented fields individually and resolve **CycleCount** using evidence. The sample permits a reasoned exclusion because independently defined TotalQty supplies the output count.
5. Run **Validation**. Every required check must pass; invalid rows are not silently discarded.
6. Switch to the **Data steward** demo role and approve; repeat as **Plant operations**. Return as **Integration lead** to publish.
7. Inspect the report, enter a compatible benchmark and create an **Investigation** with an owner and follow-up.
8. Change a mapping or replace the source to see acceptance invalidation and historical report retention. Save a template, log effort or export the workspace.

**East assembly** starts with an empty intake. Each browser has its own workspace. Reviewer role selection demonstrates the workflow; it is not user authentication.

The reviewed sample produces **3,000 total units, 300 scrap units, 10% scrap and 73.6% availability** (1,060 run minutes / 1,440 planned minutes). Availability is not OEE: performance and quality inputs for a complete OEE calculation are outside this contract.

## People, ownership and decisions

| Persona | Current friction | Role in the proposed workflow |
| --- | --- | --- |
| Leadership / acquisition sponsor | Limited comparable visibility after acquisition | Review scoped results, prioritize intervention and fund improvements |
| Plant manager / operations | Local reports require repeated explanation | Confirm definitions, review operational validity and own corrective action |
| Field engineer / equipment specialist | Equipment tags, time bases and counters differ | Explain source semantics and investigate equipment-level exceptions |
| Central integration lead / data engineer | Repeated mapping, chasing access and rework | Configure intake, reuse reviewed templates and coordinate acceptance |
| Data steward / business analyst | Metric definitions and populations can conflict | Verify units, reconciliation, evidence and comparability |
| Product manager / product owner | Risk of building broad integrations before proving value | Prioritize the first trusted report, acceptance criteria and pilot decisions |
| Design / research | Technical language can hide uncertainty | Test whether users understand scope, blocked states and required actions |
| Finance | Avoided spend and staff capacity are easily double-counted | Validate baseline costs, incremental costs and realized benefits |
| Security / platform / vendors | Source permissions and access differ across sites | Authorize exports, establish runtime controls and resolve vendor constraints |

Names and accountability in the demo are proposed roles, not confirmed Atlas organizational facts.

## Technical implementation: what runs today

The deployed product is a dependency-free **HTML/CSS/JavaScript application**. CSV parsing, validation, calculations and workflow state run in the browser. Persistence uses browser local storage; reports and workspaces can be exported.

```text
CSV + human-entered definitions/evidence
  → bounded parser and source preview
  → reviewed mapping + allowlisted unit conversion
  → 14 deterministic validation checks
  → two reviews bound to the current source/mapping version
  → publication gate
  → scoped report → compatible benchmark → owned investigation
```

- `dist/core.js`: pure parsing, validation, calculations, version checks and publication logic.
- `dist/app.js`: views, interactions, browser persistence and export behavior.
- `dist/styles.css` / `dist/index.html`: responsive interface and application entry point.
- `tests/core.test.js`: 24 correctness and failure-path tests.
- `golden/`: synthetic inputs, labelled answers, fixtures, evaluation tools and review records.

The eleven required reporting fields are `plant_id`, `asset_id`, `event_id`, `shift_id`, `timestamp_utc`, `product_family`, `total_units`, `good_units`, `scrap_units`, `run_minutes` and `planned_minutes`.

The contract covers one plant, asset/line and product population, with one row per shift. Supported duration conversions are seconds to minutes, hours to minutes and identity. Uploads are bounded to 2 MB, 10,000 data rows and 60 columns. Checks cover readiness, unresolved fields, required/unsupported targets, evidence, units, numeric validity, reconciliation, durations, scope, duplicates, shift grain and timestamps.

Changing accepted inputs invalidates current acceptance. The local fingerprint detects version changes; it is not a cryptographic signature. Historical reports retain their originating context.

## Where AI fits: planned, bounded assistance

The current MVP executes human-reviewed mappings and deterministic checks. It makes **no live model calls**. The next pilot would add an assistant to prepare a mapping draft, ask about ambiguity and assemble evidence for review.

| Assistant capability | Inputs and allowed output | Boundary |
| --- | --- | --- |
| Evidence retrieval | Authorized plant dictionary and approved documents → source excerpts/locators | Plant-scoped retrieval; stale or conflicting evidence is surfaced |
| Mapping proposal | Schema + definitions + approved contract → typed mapping draft | No guessing unsupported units or counter semantics |
| Clarification | Missing or contradictory definitions → specific owner question | Abstain until evidence resolves ambiguity |
| Review preparation | Proposed mappings + deterministic check results → review package | Human owners approve; the assistant cannot self-approve or publish |

A production orchestrator would use explicit workflow states, structured output validation, tool allowlists, bounded retries and recorded evidence. Documents are data, not instructions. Numeric truth stays in deterministic code. The assistant would have no tool for writing to machines, PLCs or source systems.

Proposed enterprise flow:

```text
Approved exports / read-only connectors
  → authenticated intake + quarantine + immutable source storage
  → scoped metadata/definition store
  → retrieval and mapping assistant
  → deterministic contract service
  → human approval service + durable audit
  → reporting API / incumbent BI + investigation queue
```

Cloud, identity, ERP/MES and historian choices must follow discovery of the existing enterprise landscape. Model/provider selection remains an evaluation decision; no untested accuracy claim is made.

## Business case and product success

The supplied baseline is approximately USD 1.2m per plant. **Illustration only:** a validated 10% reduction across two eligible onboardings would equal USD 240,000 gross avoided integration cost. This is not measured ROI. Implementation, recurring operation and rollout costs must be deducted; staff hours must not be counted again if already included in integration costs.

The first product outcome is **time to the first accepted, scoped operating report**, measured separately from access granted, usable data received and full enterprise integration.

Pilot measures should include:

- Elapsed and active time at each milestone, queue time and rework by cause.
- Mapping review time, acceptance rate and reuse with fresh local evidence.
- Critical-field evidence coverage, rejected data defects and reconciliation failures.
- Correct, supported AI proposals; unsafe proposal rate; useful clarification rate.
- Approval integrity and zero unauthorized publication or cross-plant disclosure.
- Time from a reported deviation to an owned action, and the action’s verified outcome.
- Avoided cash expenditure and capacity released, separately validated by Finance.

Before committing to benefit targets, obtain the last three onboarding timelines, the USD 1.2m cost breakdown, representative exports, actual sign-off responsibilities and one reconstructed late-underperformance decision.

## MVP-first roadmap and engineering choices

| Stage | Scope | Evidence required to proceed |
| --- | --- | --- |
| Current prototype | Exports, mapping, checks, demo reviews, reporting and investigations | Code tests, browser workflow checks and reproducible synthetic regression |
| Discovery / design partners | Observe central and plant teams; baseline cost/time; review actual definitions | Authorized sources, agreed acceptance authority and a decision that earlier data can improve |
| Bounded AI pilot | Evidence retrieval, mapping drafts and clarifications with human acceptance | SME-adjudicated cases; representative withheld data; acceptable critical-error and review-burden results |
| Production pilot | Identity, durable storage/audit, monitored jobs and parallel reporting | Security review, backup/restore exercise, rollback test and reconciled parallel run |
| Scale | Reusable connectors/templates and additional plants/metrics | Proven value per plant, capacity/load evidence and controlled schema/prompt rollout |

**Build:** metric contracts, evidence-linked review and version-specific acceptance, because these express the product’s business rules. **Reuse/buy:** incumbent identity, integration, storage, BI and managed model infrastructure where suitable. Evaluate existing integration platforms before creating custom connectors. Shift-level batch reporting limits complexity; streaming is justified only where faster action has measurable value.

Engineering cost depends on connector diversity, data volume, review time, inference volume, retention and support requirements. Track cost per accepted report and per onboarded plant. Queue ingestion jobs, isolate plant scopes and version contracts to scale without allowing one site’s defects to block all sites.

## Quality and golden dataset

**24 / 24 application tests pass. 35 / 35 executable golden cases pass.** These suites overlap in behaviors and should not be presented as 59 independent business scenarios.

The v2.0.1 dataset contains **80 synthetic author-labelled cases in 40 paired families**: mapping 20, validation 22, KPI/business reasoning 12, workflow 10, security 10 and retrieval 6. It includes raw CSV fixtures, expected structured outputs, rationales, separate model inputs/labels and an SME review sheet.

The 35 executable cases test the current rules engine. The remaining 45 specify proposed AI/control behavior and have not been tested against model or enterprise services. All labels await independent SME adjudication. The proposed holdout is not blind to its author; it does not establish unseen-plant generalization. V2 was authored after the MVP as a regression/evaluation specification, not as a claimed historical training dataset.

See [golden README](golden/README.md), [data card](golden/DATA_CARD.md) and [review sheet](golden/review-sheet.csv). No real plant records, model training or measured model accuracy are claimed.

## Run, test and deploy

Requirements: Node.js 20+ and Python 3; no npm dependencies or API keys.

```sh
npm start
# Open http://127.0.0.1:4321/
npm test
npm run build
npm run package
# Optional standalone HTML files are generated in artifacts/.
```

Run the portable golden checks from their own folder:

```sh
cd golden
python3 verify_dataset.py
python3 evaluate.py --self-test --output reports/evaluator-self-test.json
node run_mvp.cjs
python3 evaluate.py --target mvp_core --predictions reports/mvp-predictions.jsonl --output reports/mvp-regression.json
```

**Current hosting:** the verified `dist/` files were uploaded directly to the Vercel project `atlas-onboard` on 27 October 2026. The public URL is https://atlas-onboard-six.vercel.app/. This deployment is not connected to GitHub auto-deployment; code pushes require a separate deployment until the repository is connected.

For a future Git-connected Vercel deployment, import this repository, keep its root directory, use **Other** as the framework and the checked-in `vercel.json`: build `npm run build`, output `dist`. No environment secrets are needed. Only `dist` is served as the product; documentation and evaluation labels remain in the repository.

## Production readiness, security and responsible AI

This is a case-study prototype, not a production qualification. Each visitor’s workspace is local to their browser; role switching is a simulation, the local activity record is editable and storage is best-effort. Uploads are processed by application code locally and are not sent to a backend or model. Hosting necessarily serves the application assets; no analytics or external model SDK is included. Use synthetic/non-sensitive files for a public demonstration.

Production work includes:

- Server-enforced identity, plant-scoped permissions, least-privilege read-only source access and separation of review/publication roles.
- Encrypted durable storage, immutable evidence/audit, jurisdiction-specific retention and deletion policies established with Legal/Security.
- Secret management, document sanitization, prompt-injection tests, scoped retrieval and tool authorization enforced outside the model.
- Separate DEV/STAGING/PROD, reviewed releases, environment-specific secrets, migrations tested on representative data and reversible rollout.
- Metrics/logs/traces for ingestion, validation, review queues, retrieval, model latency/cost and publication; redact sensitive content from telemetry.
- Defined service objectives, retries/backpressure, idempotent jobs, incident ownership, alerts, backup/restore and rollback exercises.
- Versioned prompts/models/contracts, SME regression gates, monitored drift and periodic reassessment of quality and business outcomes.

The system supports operating decisions; it does not autonomously control equipment or assess individual worker performance. Approval gates and abstention preserve human responsibility when evidence is uncertain.

## G1 deliverable coverage

| G1 requirement | Evidence in this repository / design |
| --- | --- |
| 1. Problem, root causes, market and regulatory context | Case facts, root-cause hypotheses, market alternatives and conditional regulatory analysis |
| 2. Users, personas, workflow and friction | Stakeholder table, current/future journey and linked Figma workflow |
| 3. AI agent, value, architecture, data/systems and reliability | Bounded agent rationale, evidence/clarification example, service design and evaluation protocol |
| 4. MVP roadmap, scope, success measures, guardrails and risks | Stage gates, proposed pilot targets, owned risks, tests and golden cases |
| 5. Clear structured narrative | Evidence to hypothesis to intervention to validation and scale decision |
| 6. Enterprise security, compliance, responsible AI and governance | Access boundaries, legal applicability checks, human accountability and live governance |
| 7. Wireframes or prototype showing agent interface/workflow | Executable product workflow and Figma assistant start, clarification and review-package screens |
| 8. Golden dataset | 80 synthetic cases, expected answers, fixtures, evaluator, SME review sheet and provenance |

Read the [G1 solution brief](docs/G1-SOLUTION-BRIEF.md) for the complete user journey, market/regulatory assessment, agent example, pilot gates and governance.

The README documents the approach and its evidence limits. Proposed capabilities and business outcomes remain subject to discovery and pilot validation.
