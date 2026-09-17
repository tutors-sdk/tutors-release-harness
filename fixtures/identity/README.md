# Identity fixture

A GitHub-OAuth-shaped issuer with fixed users per role — student, enrolled,
lecturer, owner, admin — so that signed-in journeys run against both sides
with identical sessions. See `stub.mjs` for the endpoints.

## How the apps end up talking to it

The reader's Auth.js GitHub provider has `github.com` and `api.github.com`
hard-coded, and the harness must not change the image. So:

- **In the containers**, `compose.harness.yaml` gives `reader-auth-a` and
  `reader-auth-b` an `extra_hosts` entry mapping both names to the stub's fixed
  address on the compose network, and `NODE_EXTRA_CA_CERTS` pointing at
  `certs/ca.pem`, so Node trusts the stub's certificate for those names.
- **In the browser**, the harness routes `https://github.com/login/oauth/**`
  to the stub's published port (`https://localhost:8443`) with Playwright, so
  the authorise redirect lands here and bounces straight back to the reader's
  callback with a code.

Nothing else differs from a real sign-in: Auth.js exchanges the code for a
token, fetches the profile, mints its own session cookie. The reader in this
configuration also has `PUBLIC_SUPABASE_URL` pointed at the persistence stub,
so what a signed-in user's journey *writes* is captured (see
`fixtures/persistence`).

## Certificates

`certs/` holds a self-signed CA and a server certificate for `github.com`,
`api.github.com`, `identity.harness.test` and `localhost`, valid ten years,
generated with `openssl` and committed on purpose: they are test fixtures,
trusted only inside this stack's containers via `NODE_EXTRA_CA_CERTS`, and the
private keys protect nothing. Regenerate with:

```bash
cd fixtures/identity/certs
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -subj "/CN=tutors-release-harness test CA" -keyout ca.key -out ca.pem
openssl req -newkey rsa:2048 -nodes -subj "/CN=github.com" -keyout server.key -out server.csr
printf "subjectAltName=DNS:github.com,DNS:api.github.com,DNS:identity.harness.test,DNS:localhost\nbasicConstraints=CA:FALSE\n" > ext.cnf
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 3650 -extfile ext.cnf -out server.pem
rm server.csr ext.cnf ca.srl
```

## Roles

The journeys pick a role with the `login_hint` query parameter on the
authorise URL; the default is `HARNESS_ROLE` (student). Until RBAC lands in
the apps every role sees the same thing, and the signed-in journey asserts
only that a session exists and what the reader persisted for it. The
authorisation matrix (runway tier F) is where the roles start to differ.
