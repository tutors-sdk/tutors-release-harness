# A mutant: the production reader image plus one planted fault.
#
#   docker build -f mutants/Dockerfile --build-arg BASE=tutors/reader:16.2.0 \
#     --build-arg MUTANT=dropped-header -t tutors-harness/mutant-dropped-header mutants
#
# Nothing else changes: same user, same read-only filesystem, same env. The
# wrapper proxies port 3000 to the real server on 4000 and plants the fault
# at the edge (see wrap.mjs and mutants.yaml).
ARG BASE
FROM ${BASE}
ARG MUTANT=none
COPY --chown=1001:0 wrap.mjs /mutant/wrap.mjs
ENV MUTANT=${MUTANT}
CMD ["node", "/mutant/wrap.mjs"]
