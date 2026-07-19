import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // No SENTRY_AUTH_TOKEN/org/project wired yet — source map upload is a
  // later task (needs its own Sentry auth token), error capture works
  // without it.
  sourcemaps: {
    disable: true,
  },
});
