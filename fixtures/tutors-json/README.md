# tutors.json schema

`tutors-json.schema.json` is the published JSON Schema for a course's `tutors.json`, copied verbatim
from the mono-repo's `packages/jsr/types/tutors-json.schema.json` (`TUTORS_JSON_SCHEMA` in
`@tutors/tutors-types`, Rule 0263). `harness course check` reports each course against it
(`tutorsJson` in `course-check.json`, since 1.33.0); it never fails a check.

`source.json` names the mono-repo commit it was copied from. To refresh it:

```sh
git -C ../tutors-mono-repo fetch origin main
git -C ../tutors-mono-repo show origin/main:packages/jsr/types/tutors-json.schema.json > fixtures/tutors-json/tutors-json.schema.json
```

then update `source.json`'s `commit` and run `pnpm test`.
