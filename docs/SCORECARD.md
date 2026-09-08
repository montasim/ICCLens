# Product scorecard

Record a baseline before release and update it after one week. Prefer honest small samples over invented precision.

| Signal                                    | Baseline | Current | Source                                         | Decision threshold                      |
| ----------------------------------------- | -------- | ------- | ---------------------------------------------- | --------------------------------------- |
| Users completing the primary slice        | —        | —       | manual study or privacy-conscious event design | Set per product                         |
| Users understanding each permission       | —        | —       | five-person prompt test                        | 5 of 5                                  |
| First-run blockers                        | —        | —       | support and issue log                          | 0 critical                              |
| Serious/critical accessibility violations | 0        | 0       | axe plus manual review                         | 0                                       |
| Median idea-to-verified-ZIP lead time     | —        | —       | release log                                    | Trend downward without trust regression |
| Escaped defects in first seven days       | —        | —       | issue log                                      | Trend downward                          |
| Rework caused by unclear AI tasks         | —        | —       | postmortem                                     | Less than one task per release          |

Collect a signal only when it can change a product or engineering decision. Do not add telemetry merely to fill this table.
