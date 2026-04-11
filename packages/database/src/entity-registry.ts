/**
 * Entity registry — not used directly. The DataSource uses glob patterns to
 * discover entities at runtime, keeping this package free of app/* imports.
 * See data-source.ts for the entity discovery configuration.
 */
export const entityRegistry: Function[] = [];
