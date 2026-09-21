/**
 * Host ports, so a harness run can sit beside a developer's own stack.
 */

/** Default host ports of compose.harness.yaml, by the variable that moves each. tests/local-tasks.test.ts holds this to the compose file. */
export const DEFAULT_PORTS: Record<string, number> = {
  COURSE_PORT: 8080,
  IDENTITY_PORT: 8443,
  EDGE_PORT: 3300,
  PERSISTENCE_PORT_A: 8090,
  READER_PORT_A: 3100,
  CATALOGUE_PORT_A: 3101,
  LIVE_PORT_A: 3102,
  READER_AUTH_PORT_A: 3103,
  TIME_PORT_A: 3104,
  PERSISTENCE_PORT_B: 8091,
  READER_PORT_B: 3200,
  CATALOGUE_PORT_B: 3201,
  LIVE_PORT_B: 3202,
  READER_AUTH_PORT_B: 3203,
  TIME_PORT_B: 3204
};

/**
 * `--port-offset N`: every host port the stack publishes, moved by N, so a run
 * can sit beside a developer's own stack on 3100/8080/8443. A variable the caller
 * set itself wins. Only the compose substrate: the kind ports are fixed in
 * deploy/kind/kind-config.yaml.
 */
export function portEnv(offset: number, env: NodeJS.ProcessEnv): Record<string, string> {
  if (!offset) return {};
  return Object.fromEntries(Object.entries(DEFAULT_PORTS).filter(([name]) => !env[name]).map(([name, port]) => [name, String(port + offset)]));
}
