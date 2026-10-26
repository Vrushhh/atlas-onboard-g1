# Golden dataset

This is a **synthetic, author-labeled design seed**, not Atlas operational data, expert-certified truth, or evidence of model accuracy. No plant files were supplied. The design uses its positive, ambiguous, missing-data, and adversarial scenarios to define workflow guards and evaluation outputs.

There are 60 records, 30 scenario groups, and two source-packaging variants per group. Variants preserve semantics while changing plant ID and CSV/XLSX metadata. Do not treat sixty rows as sixty independent observations. Both variants stay together: development 36 records / 18 groups; validation 12 / 6; proposed holdout 12 / 6. The author has seen all labels. A genuine blind test requires independent SME adjudication and an escrowed holdout that is not used for prompt development.

Tasks: mapping (20), normalization (6), KPI (10), data quality (8), security (6), workflow (6), retrieval (4). Critical tests cover access, embedded instructions, source write-back, changed approval hashes, and failed publication checks. Labels are pending operational and data-steward review.

`golden.jsonl` is the canonical set. `golden.csv` contains equivalent data, with nested input/expected fields encoded as JSON. `manifest.json` records counts, provenance, and a SHA-256 checksum.

Run the local harness test without network, models, packages, or keys:

```
python3 evaluate.py --self-test --output harness-self-test.json
```

This uses exact expected outputs as an oracle and deliberately corrupts predictions. It tests the evaluator, not any AI model. The included harness-self-test.json records this distinction.

For an actual model experiment, have your authorized service produce JSONL rows of the form:

```
{"id":"SEED01-1","output":{"decision":"propose","target":"good_units","requires_human_approval":true}}
```

Run against the matching partition only:

```
python3 evaluate.py --predictions predictions.jsonl --split proposed_holdout --output result.json
```

The evaluator fails on missing predictions, duplicate or unexpected IDs, wrong values or types, and undeclared output keys. Numeric tolerance is 1e-6 absolute/relative; it is for fixture calculations, not a license to loosen production KPI reconciliation. Cite exact source IDs where expected. Each task has a task-specific output contract derived from the expected object. Additional human review is required for semantic evidence support, explanation quality, and unit definitions; exact matching cannot establish these.

Store experiment metadata separately: dataset checksum, model and prompt versions, dictionary/contract versions, retrieval settings, latency, tokens and reasoning-token billing, cost, and human adjudication. Report abstention coverage and incorrect-proposal precision separately, plus critical failures. Do not market harness pass rates as model pass rates.

Before production, use authorized source schemas, dictionaries, representative historical shifts, relevant manual excerpts, and independently computed KPI outputs from multiple plants. Two reviewers (operations and data stewardship) label independently, resolve disagreements, and preserve decision provenance. Hold out entire plant/source families where feasible. Add encoding, merged-cell, multilingual, product-mix, and timestamp edge cases; sanitize personal data. At least 300 real mapping decisions and a separate critical challenge suite are proposed initial validation evidence, not a statistical guarantee.
