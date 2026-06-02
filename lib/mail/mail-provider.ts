export interface MailProvider {
  send(mail: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}