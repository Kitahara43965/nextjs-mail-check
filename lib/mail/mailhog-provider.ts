import { MailProvider } from "./mail-provider";
import { transporter } from "@/lib/mail";

export class MailhogProvider implements MailProvider {
  async send(mail: { to: string; subject: string; html: string }) {
    await transporter.sendMail({
      from: "test@local.dev",
      ...mail,
    });
  }
}