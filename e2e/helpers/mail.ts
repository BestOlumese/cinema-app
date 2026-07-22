import { readFile } from "node:fs/promises";
import path from "node:path";

const OUTBOX_PATH = path.join(process.cwd(), ".e2e-outbox", "mail.jsonl");

interface MailEntry {
  to: string;
  subject: string;
  html: string;
  sentAt: string;
}

async function readOutbox(): Promise<MailEntry[]> {
  try {
    const raw = await readFile(OUTBOX_PATH, "utf-8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as MailEntry);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

// Polls the test outbox (populated by src/lib/mailer.ts's PLAYWRIGHT_TEST
// bypass, never a real SMTP send) for the most recent email to `to`, then
// extracts the first link from its HTML body — stands in for a human
// clicking the real link in their inbox.
export async function waitForMailLink(
  to: string,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const entries = await readOutbox();
    const match = entries.filter((entry) => entry.to === to).at(-1);
    if (match) {
      const hrefMatch = match.html.match(/href="([^"]+)"/);
      if (!hrefMatch) throw new Error(`No link found in email to ${to}`);
      return hrefMatch[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Timed out waiting for an email to ${to}`);
}
