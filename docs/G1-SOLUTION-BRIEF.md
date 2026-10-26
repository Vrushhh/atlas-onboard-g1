# Atlas Onboard G1 solution brief

## 1 Problem and context

We propose a reporting bridge that gives Atlas an earlier, explicitly scoped view of a new plant while full integration continues. Our next AI pilot would help engineers interpret unfamiliar data and assemble evidence for human acceptance. This focuses the product on a management decision, not on connecting every machine at once.

The supplied case establishes growth from four to eleven plants, two expected acquisitions, a nine-person central integration team, seven months on average to reliable comparable data for the last three onboardings and approximately USD 1.2m integration cost per plant. Local spreadsheets do not roll into group reporting. Two of five acquired sites were later found below acquisition production assumptions. It does not establish downtime, a future underperformance rate, avoidable cost or the causes of each delay.

Heterogeneous machines, systems and local practices are facts. Repeated interpretation, access queues, uncertain sign-off authority and capacity contention are hypotheses. We must reconstruct the last three timelines, rework and approvals, cost records and one late-underperformance decision before choosing which bottleneck deserves investment.

### Market and regulatory setting

Our inferred initial segment is manufacturers integrating acquired or greenfield plants. Group operations/integration leadership buys; central engineers and stewards use the workflow alongside plant specialists. The immediate problem is trusted operating visibility during integration. We do not claim a market size, validated willingness to pay or verified competitive superiority.

| Alternative | Where it helps | Trade-off for this case |
| --- | --- | --- |
| Local spreadsheets and manual consolidation | Rapid local reporting with familiar tools | Definitions, version control and group acceptance remain manual |
| Full ERP/MES integration | Broad durable integration | May leave leadership waiting for the larger project; timeline depends on actual scope |
| Existing integration/BI platform | Reuses approved connectors and reporting infrastructure | Still needs agreed field meaning, evidence and acceptance ownership |
| Atlas reporting bridge on approved platforms | Earlier scoped reporting, mapping reuse and review accountability | Needs reliable exports and human reviewers; does not solve every integration task |

Manufacturing integration must preserve meaning as data crosses systems. NIST's semantic-integration research and ISA-95 provide relevant reference context [S1, S2]. The choice to focus on evidence and acceptance is our inference from the case, not an externally validated market conclusion.

Atlas's jurisdiction, source contracts and personal-data exposure are unknown. A real pilot requires a signed applicability assessment covering source/export rights, data categories, permitted purposes, retention, processing location, cross-border conditions and relevant AI/industrial safety obligations. Where GDPR applies, purpose limitation and minimization matter [S3]. EU AI Act assessment depends on jurisdiction and actual use; worker evaluation or safety-related functionality would trigger renewed classification review [S4]. The proposed scope excludes worker scoring and autonomous machine actions. No jurisdiction-specific compliance or standards certification is claimed. CISA's OT guidance and the voluntary NIST AI RMF guide design, not a blanket assertion of compliance [S5, S6].

## 2 Users and the full journey

| Stage | Current workflow and friction | Proposed workflow and responsibility | Value to test |
| --- | --- | --- | --- |
| Acquisition handover and scope | M&A assumptions, access and integration scope require coordination; actual handoff records are unavailable | Integration lead records plant, line, product, dates and owners; Finance supplies benchmark provenance | Fewer scope resets; clear decision and reporting population |
| Source access and extraction | Local staff prepare spreadsheets; equipment and vendor restrictions may delay access | Plant/OT owner authorizes exports and provides a dictionary; Security approves safe read-only routes | Reuse data already available without changing control systems |
| Interpretation | Central engineers translate unfamiliar fields and ask plant specialists; effort is unmeasured | Proposed assistant retrieves local definitions, drafts supported mappings and pauses for unresolved meaning | Less repeated lookup and clearer questions |
| Correction and verification | Reconciliation, units and definitions may need repeated exchanges | Deterministic checks identify failed rules and CSV rows; plant staff correct the source or explain meaning | Faster correction and fewer misleading numbers |
| Acceptance | Actual Atlas sign-off authority is unknown | Proposed group steward checks comparability; operations confirms physical validity; both accept the current version | Named responsibility for trusted data |
| Reporting | Local spreadsheets do not roll into group metrics during onboarding | Integration lead publishes a scoped report with coverage, window and evidence | Earlier useful visibility, separately from full integration |
| Decision and follow-up | Underperformance can remain undiscovered until integration completes | Leadership/plant manager compares a compatible benchmark, assigns an investigation and records action/outcome | Shorter signal-to-action time and accountable follow-up |
| Reuse and ongoing reporting | Each integration starts from scratch | Steward versions templates; each new site supplies local evidence and fresh approval | Less repeat work without assuming all plants are identical |

The product manager owns the problem/outcome and prioritization; the product owner maintains acceptance criteria and the backlog. The business analyst reconciles definitions and process baselines. Design tests comprehension and recovery paths with operators, engineers and leadership. Platform/support owns reliability and incidents. Finance validates economic value. Vendors explain proprietary systems; Legal/Security governs access and processing. These are proposed responsibilities, not a confirmed Atlas org chart.

## 3 The agent and why it fits

**Agent goal:** prepare a reviewable mapping package for one approved export, one line and one comparable product population. Every proposed critical mapping must point to relevant source evidence. The agent stops when meaning is uncertain and asks the accountable owner.

A language model is potentially useful for varied document language, definitions and focused clarification. Conventional code remains better suited to arithmetic, unit conversion, schema checks and release gates. A chat interface alone cannot establish trustworthy operating data. The assistant must work inside the reporting workflow and reduce review effort without increasing unsupported decisions. Where approved dictionaries already match exactly, ordinary automation may be sufficient.

### Example interaction

1. The integration engineer provides an authorized export and its approved dictionary.
2. The assistant finds a definition stating that RunSeconds is elapsed run time for the reporting shift, in seconds. It proposes `run_minutes = RunSeconds / 60` and cites the source locator.
3. CycleCount is described only as machine cycles. The assistant does not equate cycles to produced units. It asks the plant engineer whether cycles represent output and whether TotalQty independently supplies output for the same population.
4. The owner supplies the definition. If TotalQty independently measures output, the engineer may record a reasoned CycleCount exclusion. Without sufficient evidence, the field stays unresolved.
5. Code validates the source and mapping. The assistant assembles the evidence, unresolved questions and failed checks into a review package.
6. A data steward and operations reviewer accept the current version. The integration lead publishes. The model cannot approve, publish, modify the source or control equipment.

This interaction is a proposed assistant behavior illustrated in the existing Figma start/clarify/review-package flow. The live MVP executes manual mappings and deterministic gates; no model performance is claimed.

### Architecture and data dependencies

Authorized exports or approved read-only connectors enter authenticated intake and durable source storage in the production design. A plant-scoped metadata store records source IDs, schema, operating window, product/line scope, document approval/version and ownership. A bounded job orchestrator retrieves approved definitions, requests a typed draft, validates it and pauses for owner clarification when required. Deterministic services perform conversions, checks and calculations. The approval service binds reviews to the current source/contract version. Approved views feed existing BI; an investigation queue records operating follow-up.

Required evidence includes a representative export, local field dictionary, units and time bases, permitted source rights, approved metric definitions, product/line population, benchmark provenance and review authority. ERP/MES/historian stack, cloud and identity choices remain discovery inputs. The model receives only authorized evidence required for its task. Evidence text cannot grant permissions or override the task contract.

The proposed output contract contains field, target, transform, evidence IDs, decision and a clarification question/reason. Tools are allowlisted for profiling, scoped retrieval, draft preparation, requesting clarification and reading validation results. No arbitrary SQL, shell, external fetch, source write, machine-control or publication tool is available. Record decisions and evidence summaries rather than private chain-of-thought. Cap attempts and token budgets; failed or conflicting outputs return to human review.

### Reliability validation

We will compare the manual workflow and assisted workflow on the same adjudicated tasks. Operations specialists and a group steward independently label representative data, reconcile disagreements and escrow new test cases before prompt tuning. Keep paired scenarios together. Measure evidence-supported mapping precision, unsupported critical decisions, clarification usefulness/recall, coverage, user correction time and total time to accepted report. Score exact structured answers and separately review whether evidence actually supports the decision.

Test missing definitions, scrap/rework confusion, counters versus units, wrong time bases, conflicting/stale documents, mixed plant scopes, prompt injection, unauthorized retrieval and attempted self-approval. Failure injection should cover malformed model outputs, timeouts, duplicated jobs and stale approvals. After launch, sample accepted and rejected work, track schema/model drift and roll back a prompt/model version when critical behavior regresses.

Current evidence: 24 application tests and 35 executable golden cases pass. The broader set has 80 synthetic author-labelled cases in 40 families. Forty-five cases specify proposed policy behavior and await model/service execution. These do not establish semantic model quality, independent ground truth or business impact.

## 4 MVP scope roadmap success measures and risks

**Working prototype:** browser-local CSV intake, evidence-backed manual mappings, fourteen checks, demo reviewer handoffs, publication gates, scoped metrics, compatible benchmarks, owned investigations, reusable templates, effort logs and exports. The contract supports one plant/line/product population and one row per shift. Role selection is a simulation; shared identity, durable server storage, live AI and enterprise connectors remain future work.

| Stage | Scope and gate | Owner |
| --- | --- | --- |
| Discovery | Identify the dominant delay, cost baseline, export rights, definitions, actual acceptance owner and one actionable earlier decision | Product lead with integration, operations, Finance and Legal |
| Workflow validation | Observe intake, ambiguity recovery, failed-check correction, approval and investigation tasks; fix comprehension/usability issues | Design and product owner |
| Bounded agent pilot | One approved source/line/product, authenticated reviewers and durable records; parallel-run against signed reporting | Integration lead, steward and operations |
| Operational acceptance | Security/legal sign-off, monitored jobs, recovery/rollback exercise, support owner and evaluated model version | Security, platform and AI governance |
| Expansion | Reuse only after quality, adoption, effort and net-value evidence pass; revalidate new site definitions | Sponsor, Finance and product lead |

Proposed acceptance targets are hypotheses for stakeholder agreement, not achieved results: all mandatory checks and both current-version reviews must pass before publication; zero unsupported critical decisions or unauthorized actions in the release suite; at least 95% evidence-supported precision on adjudicated supported mapping proposals, reported with coverage and clarification rates; at least four of five representative users complete the main task without facilitator intervention; and at least 20% lower median active review time than the manual baseline on matched pilot tasks. Finance must validate net benefit before expansion. Thresholds may change after discovery, with the reason recorded before evaluation.

Measure acquisition close, authorized access, usable export, first accepted report, recurring reporting and full integration separately. Track active work, waiting, correction loops and signal-to-action time. The supplied baseline cost is USD 1.2m per plant. A 10% reduction across two eligible plants would be USD 240,000 gross, purely as a sensitivity. Deduct build, operation, rollout and change costs. Avoid counting the same staff hours as both released capacity and cash savings.

| Risk | Mitigation and stop condition | Accountable owner |
| --- | --- | --- |
| Fast but semantically wrong mapping | Evidence locators, independent SME review and mandatory abstention; stop release on unsupported critical mapping | Data steward |
| Source or benchmark not comparable | Scope/grain/unit checks and benchmark provenance; no cross-population comparison | Plant operations |
| Prompt injection or cross-plant retrieval | Treat documents as data; enforce authorization outside the model; stop on any unauthorized access/action | Security owner |
| Approval reuse after source changes | Server-side version-bound acceptance in production; invalidate on relevant changes | Integration/platform owner |
| Unsafe extraction or scope creep into equipment control | Read-only approved exports, no control tools; reassess any connectivity or use-case change | OT owner |
| AI adds review work or fails to improve decisions | Matched manual/assisted task study, correction-time measurement and pilot stop/re-scope decision | Product lead |
| Benefits do not cover cost | Separate avoidable cash from capacity, track cost per accepted report and validate net value | Finance and sponsor |
| Real data or provider terms breach obligations | Signed applicability/processing assessment before real-data access | Legal/Privacy |

## 5 Narrative and decision logic

The case supplies delayed comparable visibility. We hypothesize that interpretation, rework and acceptance contribute, but discovery must test that. We choose an export-based reporting bridge because it can test earlier visibility within a bounded scope. We add AI only where language/definition work benefits, retain deterministic checks and human acceptance, and compare outcomes against the manual process. We expand only if quality, usability, legal applicability and economic value support the decision.

## 6 Enterprise governance

The data steward owns dictionaries and metric contracts. Operations owns physical interpretation and corrective action. Product owns scope and evaluation goals. The AI governance owner approves prompt/model changes against regression and representative withheld evaluations. Security/Privacy owns access, sensitive-data handling and incident escalation. Platform owns service objectives, telemetry, recovery and release rollback. Finance and the sponsor approve expansion against verified value.

Before a pilot, agree source purpose/rights, data minimization, retention/deletion, allowed processing region, vendor terms, reviewer separation and incident response. Apply plant-scoped authorization before retrieval or tools. Keep sensitive source text out of routine logs. Version sources, definitions, prompts, models and approvals. Review critical incidents immediately, sample quality regularly and reassess obligations when countries, providers, data categories or intended uses change. Use NIST AI RMF's Govern, Map, Measure and Manage as a voluntary organization aid [S6], not a compliance certificate.

Production planning remains supporting engineering evidence: separate DEV/STAGING/PROD, durable encrypted storage, monitored/idempotent jobs, append-only audit, backups/restoration, migration rehearsal, canary release and tested rollback. The public browser prototype does not implement these enterprise controls.

## 7 Interface and workflow evidence

Live product: https://atlas-onboard-six.vercel.app/

Source and README: https://github.com/Vrushhh/atlas-onboard-g1

Figma workflow: https://www.figma.com/design/YxgmWVqyBo10N08aSBc8D9

The Figma screens show assistant start, evidence clarification and review-package handoff. The executable product demonstrates the surrounding intake-to-action workflow. Requirement 7 permits wireframes or a prototype; both are supplied.

## 8 Golden dataset and provenance

Golden dataset 2.0.1 contains 80 synthetic cases across mapping, validation, KPI/business reasoning, workflow, security and retrieval. Raw CSVs, expected answers, rationales, a review sheet and a portable evaluator are included.

The original 60-record v1 design seed is supplied separately in `design-seed-v1/`. Do not pool it with the active 80-case set. V1 examples served as a design seed; v2 was authored after the MVP to formalize and broaden regression behavior. We do not retroactively claim that the 80 cases trained a model or all preceded product development. All data and labels are synthetic/author-labelled, SME adjudication is pending and the proposed holdout is not blind to the author. Before a real AI pilot, replace or supplement these examples with permitted representative data and independently withheld labels.

## Sources and applicability

S1 NIST, Standards-based Semantic Integration of Manufacturing Information: https://www.nist.gov/publications/standards-based-semantic-integration-manufacturing-information-past-present-and-future

S2 ISA, ISA-95 enterprise-control system integration: https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard

S3 European Commission, GDPR principles: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en

S4 European Commission, AI Act risk-based framework: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai

S5 CISA and partner guidance on OT cybersecurity principles: https://www.cisa.gov/news-events/alerts/2024/10/01/asds-acsc-cisa-fbi-nsa-and-international-partners-release-guidance-principles-ot-cybersecurity

S6 NIST AI Risk Management Framework 1.0, voluntary framework: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10

Sources checked 27 October 2026. The supplied Atlas screenshots establish the case facts. The supplied G1 document establishes the eight assessment requirements. External references supply general context; none verifies Atlas's legal identity, actual architecture, operating data or regulatory applicability.
