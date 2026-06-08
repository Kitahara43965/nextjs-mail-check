import { resend } from "@/lib/resend";
import { transporter } from "@/lib/mail";
import { AuthTokenType } from "@prisma/client";
import { getMailProvider } from "@/lib/mail/get-mail-provider";


export async function sendVerificationEmail(
  email: string,
  token: string,
  authTokenType: AuthTokenType,
) {
  const baseUrl = process.env.NEXTAUTH_URL;
  let stringUrl:string = "";
  let stringSubject:string = "";
  let stringHtml:string = "";


  if (authTokenType === AuthTokenType.EMAIL_VERIFICATION) {
    stringUrl = `${baseUrl}/api/verify?token=${token}`;

    stringSubject = "メール認証";

    stringHtml = `
      <h1>${stringSubject}</h1>

      <p>下のボタンを押して認証してください</p>

      <a
        href="${stringUrl}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
        "
      >
        メール認証する
      </a>
    `;
  }

  if (authTokenType === AuthTokenType.PASSWORD_RESET) {
    stringUrl = `${baseUrl}/reset-password?token=${token}`;

    stringSubject = "パスワード再設定";

    stringHtml = `
      <h1>${stringSubject}</h1>

      <p>下のボタンを押してパスワードを再設定してください</p>

      <a
        href="${stringUrl}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
        "
      >
        パスワード再設定する
      </a>
    `;
  }

  const mailProvider = getMailProvider();

  try {
    const result = await mailProvider.send({
      to: email,
      subject: stringSubject,
      html: stringHtml,
    });

    console.log("send result", result);
  } catch (error) {
    console.error("send error", error);
  }

}