# Current MVP validation

Checked 26 October 2026. Runtime: browser-local JavaScript with reviewed sample mappings; model services are planned. All preloaded operating data is synthetic.

## Automated checks

`node --test tests/core.test.js` from `prototype/` passes **24 / 24 tests**. These exercise CSV quoting and row limits, changed-source calculations, evidence and required-field gates, unit conversion, exact count reconciliation, invalid numeric values, safe aggregate precision, duplicate IDs, duplicate shift populations, mixed scopes, invalid calendar dates and missing timezones, zero denominators, weighted aggregation, UTC ordering across offsets, publication gates, stale approvals, change invalidation, historical report retention, benchmark provenance, rejected replacement files and workspace serialization.

These tests establish correctness for the covered cases. They do not establish production security, industrial connectivity, model accuracy or business impact.

## Browser workflow verified

- Opened the local HTTP application and confirmed a successful HTTP 200 response.
- Confirmed plant readiness decisions, explicit review of thirteen documented sample fields and separate resolution of the unsupported CycleCount field.
- Passed all fourteen required validation checks on three sample records.
- Recorded the Data steward and Plant operations demo reviews separately; published through the Integration lead demo role.
- Confirmed the report displays 3,000 total units, 300 scrap units, 10.0% scrap, and 1,060 / 1,440 minutes = 73.6% availability. Availability is explicitly not OEE.
- Added a period-specific benchmark with source evidence and comparability confirmation; created and updated an owned investigation.
- Reloaded the page and verified investigation persistence.
- Uploaded an actual local CSV through the browser file chooser. The file name, record count and source preview updated. Replacement invalidated the current report and retained the historical report.
- Loaded the error fixture and verified that validation identifies unreconciled output in CSV row 2.
- Created an additional synthetic QA plant and recorded 1.5 hours of review effort.
- Checked 390 px, 708 px and 1,440 px layout widths. Corrected the observed narrow-screen grid overflow. Confirmed document width equals viewport width at the tested sizes; wide data tables scroll within their panels.
- Captured overview and operating-report screenshots; observed no browser console errors in the inspected log window.

Saved an approved mapping template, applied it to the separate QA plant as an unreviewed draft, and verified that missing local evidence blocks acceptance. Exported an operating report as JSON through the browser download flow. Other export variants were not exhaustively browser-tested. The source report remains scoped to the uploaded rows, not complete real-plant coverage.

## Current delivery verification

The clean repository serves dist/ on Vercel. Standalone HTML can be generated into artifacts/ with npm run package. No API key or npm dependency is required.

The v2 golden set contains 80 synthetic author-labelled cases. Its 35 executable cases pass against the current MVP engine; 45 proposed-policy cases await model/service testing. Dataset checks and evaluator self-tests are separate from measured model accuracy. See golden/README.md and golden/DATA_CARD.md.

## Production limits

Role selection simulates handoffs; local persistence and activity records are editable. Real authentication, authorization, durable storage, immutable audit, enterprise connectors, monitoring, backup/restore and production acceptance remain future work. Browser workflow checks do not establish real ROI or operational outcomes.
