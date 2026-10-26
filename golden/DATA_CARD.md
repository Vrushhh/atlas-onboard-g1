# Dataset card: Atlas Onboard v2.0.1

## Intended purpose

A submission-ready synthetic evaluation specification for plant onboarding: interpreting heterogeneous exports, preserving evidence, calculating scoped metrics, enforcing acceptance gates and defining safe assistant behavior. It supports G1 deliverable 8 and the agent evaluation, roadmap and governance requirements 3, 4 and 6.

## Provenance and truth status

The supplied case establishes the business context: 4 to 11 plants, nine central staff, seven months to reliable comparable operating data, approximately USD 1.2m integration cost per plant and late discovery of underperformance in two of five acquisitions. It supplies no real exports, integration task logs, detailed cost records, equipment dictionaries or SME labels.

All operating rows, definitions, identifiers, timestamps, permissions and attack text in this dataset are authored synthetic examples. Definitions are treated as authoritative **inside the scenario** solely to make the expected decision reproducible. They do not assert facts about an actual Atlas plant. All labels await independent operations and data-steward review.

V1 was a 60-record design seed. V2 contains 80 cases in 40 families and was generated on 27 October 2026 after the MVP. It formalizes evaluation behavior rather than claiming historical training provenance. No model training, fine-tuning or model inference was performed.

## Label construction

Mapping and retrieval labels follow the supplied synthetic evidence, approved reporting contract and explicit uncertainty policy. Validation labels specify the current rule IDs and all affected CSV rows, with headers counted as row 1. KPI labels use independent Python rational arithmetic, not the application under test. Workflow labels distinguish a stored report object from a report whose acceptance is current. Security labels specify proposed server-side controls rather than pretending that demo role switches provide authorization.

A paired family changes relevant evidence or state so the required result changes, or tests two distinct failures of the same control. Opaque IDs and equal per-family output schemas reduce superficial answer hints. This does not eliminate all synthetic regularities or author bias.

## Scope

The current contract has 11 required fields: plant_id, asset_id, event_id, shift_id, timestamp_utc, product_family, total_units, good_units, scrap_units, run_minutes and planned_minutes. Supported transformations are identity, seconds_to_minutes and hours_to_minutes. The first report covers one plant, line and comparable product population. It reports output, scrap rate and availability. It does not infer OEE, physical conversions, financial ROI or full integration completion from insufficient evidence.

The suite exercises every current validation check. Deliberate failure cases include fractional/unsafe counts, unbalanced totals, duplicate records or shift populations, missing reviews, unsupported targets, invalid calendars, mixed populations and invalid planned time. Security examples include embedded instructions and fake approvals, cross-plant access and prohibited source or machine writes.

## Observed verification

- 80 expected outputs satisfy the supported-schema-subset checker.
- Every paired family stays in one partition, with matching output schemas.
- All 14 current validation checks appear in the failure coverage.
- 35 executable cases pass against the unchanged MVP rules-engine snapshot.
- 45 cases remain proposed-policy specifications, without AI/security-service execution.
- The evaluator rejects unsafe output additions and malformed prediction envelopes.
- Model calls: zero. Real plant records: zero. Independent SME approvals: zero.

The 35-case regression result covers only the documented adapter operations. It does not establish identity enforcement, durable storage, physical semantics, model accuracy, human usability, industrial connectivity or production reliability. The existing 24 application tests are a separate verification set.

## Partitions and leakage limits

Development: 42 cases / 21 families. Validation: 16 / 8. Proposed holdout: 22 / 11. Every task appears in each partition. The author has seen all labels, so the holdout is not blind. Common base schemas, policies and fixtures span partitions. A case-level score cannot establish performance on an unseen plant, source system, product family, language or operating regime.

The full golden file, labels and review sheet must stay outside inference context. A future reviewer should escrow new real-source families before prompt development. Human-generated labels should record evidence, reviewer identities, disagreements, resolution and contract version.

## Known omissions and future evidence

The set does not exercise real ERP/MES/historian connectors, OCR, XLSX parsing, physical PLC operations, real user identity, data residency controls, multilingual production dictionaries, service outages or operational load. Unicode/locale issues, hidden workbook logic, long-tail equipment semantics, counter resets and real distribution shift need additional representative data and independent review. No accuracy target is statistically guaranteed by this sample size.

Before pilot release, obtain authorized source inventories, representative historical exports, approved definitions, signed local reports and independent KPI calculations. Test access controls and injection resistance in the actual backend, parallel-run reporting, measure correction effort and exercise recovery. Verify useful leadership actions and finance-approved benefits separately from mapping accuracy.

## Privacy and governance

SYN identifiers and synthetic reviewer names denote invented entities. No personal records, credentials or private plant data are included. The attack text is inert test content. Preserve provenance, restrict label access during evaluation, approve any future real-data processing and version all adjudicated changes. The operations owner verifies physical meaning, the data steward owns comparability, the integration lead owns rollout and the platform/security owners qualify production controls.
