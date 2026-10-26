# Atlas Onboard golden dataset v2.0.1

**80 synthetic, author-labelled cases in 40 paired scenario families.** Created 27 October 2026 for the supplied plant-onboarding case and the current Atlas Onboard MVP. No real plant files or independently adjudicated labels were supplied.

This is an executable regression and proposed-policy evaluation set. It is not evidence of model accuracy or production readiness. Independent operations and data-steward review remains pending for every label.

## What to open

- **golden.csv**: complete dataset, including inputs, expected structured answers and rationale. JSON fields remain JSON strings in CSV cells.
- **review-sheet.csv**: concise case catalogue and blank review/adjudication columns for operations and stewardship reviewers.
- **golden.jsonl**: canonical machine-readable dataset with task, family, split, risk, input, expected answer, rationale and output schema.
- **DATA_CARD.md**: provenance, scope, limitations and review requirements.
- **inputs/**: model-facing partitions with inline source data and task schemas, excluding verdicts and rationales.
- **labels/**: matching answers and rationales. Keep these out of the model's context.
- **fixtures/**: neutral-named CSVs for actual uploads and deterministic checks.
- **docs/**: reporting contract, family catalogue and reviewed base-source context.
- **reports/**: evaluator self-test, dataset integrity checks and observed MVP regression results.

## Coverage

| Task | Cases | Families | Main behaviors |
| --- | ---: | ---: | --- |
| Mapping | 20 | 10 | Definition evidence, scrap versus rework, duration conversion, cycles, scope and conflicting meaning |
| Validation | 22 | 11 | All 14 current checks, including missing targets, units, safe counts, reconciliation, grain and timestamps |
| KPI and business reasoning | 12 | 6 | Weighted ratios, missing denominators, availability versus OEE, benchmark comparability and scenario versus ROI |
| Workflow | 10 | 5 | Two current approvals, change invalidation, transactional replacement, template review and integration milestones |
| Security | 10 | 5 | Plant authorization, prompt injection, prohibited writes, self-approval and vendor permission |
| Retrieval | 6 | 3 | Plant scope, document approval/currentness and contradictory evidence |
| **Total** | **80** | **40** | **21 cases marked critical** |

Both members of each family remain in the same partition. These are evidence or data counterfactuals, not mere file-name variants. The family count is not a statistical independence claim.

| Partition | Cases | Families |
| --- | ---: | ---: |
| Development | 42 | 21 |
| Validation | 16 | 8 |
| Proposed holdout | 22 | 11 |

The author has seen every label. The proposed holdout is **not blind**. Shared schemas and base fixtures span partitions. This tests contract behavior, not generalization to unseen plants. A genuine external test requires new representative data, independent adjudication and an escrowed holdout.

## Run the checks

Python 3 and Node.js are sufficient. No packages, credentials, network or model calls are required. Run from this folder:

```sh
python3 verify_dataset.py
python3 evaluate.py --self-test --output reports/evaluator-self-test.json
node run_mvp.cjs
python3 evaluate.py --target mvp_core --predictions reports/mvp-predictions.jsonl --output reports/mvp-regression.json
```

Observed result on the bundled, unchanged MVP engine snapshot: **35 / 35 executable cases pass**. These are deterministic application checks, not AI test scores. The other **45 cases specify proposed AI, business-policy or enterprise-control behavior** and have not been executed against an AI system or production access-control service.

The snapshot in **system_under_test/core.js** matches the current MVP source at generation. To test another implementation, supply its CommonJS module path through `ATLAS_CORE_PATH`. The manifest records the snapshot hash. The gold-label generator does not call this module.

The evaluator self-test uses exact expected outputs and deliberately unsafe mutations to verify the evaluator. Its oracle pass result must never be described as measured model accuracy.

## Evaluate a future AI system

1. Select one **inputs/** partition and provide only that file plus its authorized source context to the system. The CSV bytes and materialized plant state are inline where needed. Do not provide the canonical golden file, labels, review sheet or case catalogue as model context.
2. Use the task's output schema. Record answers as JSONL:

```json
{"id":"ATG-opaque-case-id","output":{"decision":"clarify","target":null,"transform":null,"source_unit":null,"question_code":"MISSING_FIELD_DEFINITION","requires_human_review":true,"evidence_ids":[]},"metadata":{"model_version":"record-this","prompt_version":"record-this"}}
```

3. Run against the matching split only:

```sh
python3 evaluate.py --split proposed_holdout --predictions predictions.jsonl --output reports/model-run.json
```

The evaluator reports case pass rates, task/risk breakdowns, missing and unexpected IDs, critical failures, proposal precision, proposal coverage and clarification recall. It rejects duplicate IDs, non-finite JSON, undeclared output keys, wrong types, incorrect/null values, fabricated citations and unsafe extra actions. Evidence/check arrays use exact unordered sets without duplicates. Counts and currency integers compare exactly. Floating metrics use absolute tolerance 1e-8 and relative tolerance 1e-9. Use full-precision values, not rounded display percentages.

Exact structured matches cannot establish whether prose is supported by evidence, whether a clarification is useful, or whether an approved definition reflects the real process. Operations and stewardship reviewers must assess those qualities independently. Record latency, token use, total job cost, correction time, prompt/model/dictionary versions and tool traces separately. Zero critical failures is necessary, not sufficient, for release.

## Review and adjudication

Every row in **review-sheet.csv** starts PENDING. Operations and stewardship should label independently, identify disagreements, agree a final decision with evidence and record the adjudication. Do not silently replace labels. Version every approved change, regenerate hashes and rerun the checks. Add authorized real-source families and hold out entire plant/source groups where practical.

Model-facing IDs are opaque. Model-facing schemas match within each paired family and do not enumerate the expected verdict. Validation schemas list every supported check, rather than revealing which check should fail. Inputs exclude severity labels and case titles that could hint at the answer.

## Relationship to earlier work

