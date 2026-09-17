# Identity fixture (planned)

A stub OIDC issuer with fixed users per role — anonymous, student, enrolled
student, lecturer, course owner, admin — so that role-bearing journeys run
against both sides with identical sessions.

Not needed yet: every journey today runs in anonymous mode
(`PUBLIC_ANON_MODE=TRUE`), which is also the mode the harness must protect
first (any persistence write during an anonymous journey is a finding). The
stub arrives with the authorisation matrix (runway tier F) and RBAC (#77),
when there are roles to hold.

Shape when it lands:

- One container, `identity`, on both sides' network, serving
  `/.well-known/openid-configuration`, `/authorize`, `/token`, `/userinfo`.
- Deterministic subjects and tokens per role; no randomness, no expiry inside
  a run.
- The apps point at it with the same env on both sides; the harness's journeys
  pick a role by name.
