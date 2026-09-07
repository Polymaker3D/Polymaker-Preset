/**
 * Shared PostHog client for build scripts.
 *
 * The client is optional — if POSTHOG_API_KEY is not set the module exports
 * a no-op so build scripts keep working without analytics configured.
 *
 * In non-production environments a loud warning is printed so the missing key
 * is never silently ignored.
 */

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST;

let posthog = null;

if (apiKey) {
  // Keep dependency-free generation working when analytics is disabled.
  const { PostHog } = await import('posthog-node');
  posthog = new PostHog(apiKey, {
    host: host || 'https://us.i.posthog.com',
    // Build scripts are short-lived processes — flush immediately so no
    // events are dropped when the process exits.
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'POSTHOG_API_KEY variable required by PostHog is missing or un-configured, ' +
    'this causes events to be silently missed. ' +
    'This error stops appearing once POSTHOG_API_KEY is configured.'
  );
}

/**
 * A stable distinct ID for CI / build-time events.
 * Uses CI_COMMIT_AUTHOR, GIT_AUTHOR_NAME, or falls back to 'build-script'.
 */
export const buildDistinctId =
  process.env.CI_COMMIT_AUTHOR ||
  process.env.GIT_AUTHOR_NAME ||
  process.env.USER ||
  'build-script';

/**
 * Capture a build-time event. No-ops when PostHog is not configured.
 * @param {string} event
 * @param {Record<string, unknown>} [properties]
 */
export function capture(event, properties) {
  if (!posthog) return;
  posthog.capture({ distinctId: buildDistinctId, event, properties });
}

/**
 * Capture an exception. No-ops when PostHog is not configured.
 * @param {unknown} error
 */
export function captureException(error) {
  if (!posthog) return;
  posthog.captureException(error, buildDistinctId);
}

/**
 * Flush all pending events and shut down. Call once before process exit.
 */
export async function shutdown() {
  if (!posthog) return;
  await posthog.shutdown();
}
