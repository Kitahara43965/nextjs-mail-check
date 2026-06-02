// lib/mail/getMailProvider.ts
import { MailProvider } from "./mail-provider";
import { ResendProvider } from "./resend-provider";
import { MailhogProvider } from "./mailhog-provider";

export function getMailProvider(): MailProvider {
  switch (process.env.MAIL_PROVIDER) {
    case "resend":
      return new ResendProvider();

    case "mailhog":
    default:
      return new MailhogProvider();
  }
}