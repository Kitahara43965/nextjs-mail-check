import { MailProvider } from "./mail-provider";
import { resend } from "@/lib/resend";

export class ResendProvider implements MailProvider {
  async send(mail: { to: string; subject: string; html: string }) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      ...mail,
    });
  }
}