# Persistence seeds (since 1.47.0)

Rows a Rule journey puts in its side's persistence stub before it opens an app that only reads, such as the time app.
The step `the persistence stub holds the seed "<name>"` reads `<name>.json` here and posts it to the stub's
`/_harness/seed`: each key is a table, each value its rows. Keys starting with `_` are notes and are not sent. The stub
answers reads of a seeded table with its rows until the next journey's reset, and never records them in the ledger.

| Seed | Read by | What it holds |
| --- | --- | --- |
| `time-course.json` | 0590, 0591 | the Rule journeys' course as `harness-rules`; three students; two students' calendar days in September 2026 (30-second blocks); six lab records over two topics, one for the least engaged student |

Keep the dates fixed and in the past of the harness's clock, so both sides compute the same weeks and medians.
