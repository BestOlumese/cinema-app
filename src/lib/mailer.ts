import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Playwright's e2e suite runs against the real dev DB but must never send a
// real email — it reads outgoing mail from this file instead (see
// e2e/helpers/mail.ts). Real users never hit this path.
const TEST_OUTBOX = path.join(process.cwd(), ".e2e-outbox", "mail.jsonl");

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.PLAYWRIGHT_TEST === "1") {
    await mkdir(path.dirname(TEST_OUTBOX), { recursive: true });
    await appendFile(
      TEST_OUTBOX,
      `${JSON.stringify({ to, subject, html, sentAt: new Date().toISOString() })}\n`,
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    html,
  });
}
