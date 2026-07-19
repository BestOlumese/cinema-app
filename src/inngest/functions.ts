import { inngest } from "@/lib/inngest";

// Phase 0 infrastructure check only — first real function lands with the
// feature that needs it. Kept as an empty array otherwise.
export const functions: ReturnType<typeof inngest.createFunction>[] = [];
