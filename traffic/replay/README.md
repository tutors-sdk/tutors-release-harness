# Replay traffic (planned, phase H4)

A sanitised sample of production access logs — paths and methods only, no
identities, no query strings that carry them — replayed against both sides
with the same ordering and pacing.

The journeys in `../journeys` are the traffic the harness *understands*: it
knows which page each step lands on and captures the DOM there. Replay is the
traffic the harness *does not understand*: it only knows the request line, so
it captures status, headers, timing and the response schema hash per request.
Its value is breadth — every route production actually serves, including the
ones nobody wrote a journey for — and its cost is that a diff there is harder
to attribute.

Format, when it lands: one JSON line per request,
`{"t": <ms offset>, "method": "GET", "path": "/course/..."}`, with a
`SOURCE` file naming the log window and the sanitiser commit that produced it.
