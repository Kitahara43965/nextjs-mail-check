export function getVerifyMessage(
  reason: string | null,
): string {
  switch (reason) {
    case "login":
      return "メール認証が完了していません。認証メールをご確認ください。";

    case "register":
      return "会員登録が完了しました。認証メールをご確認ください。";

    case "invalid":
      return "認証リンクが無効です。認証メールを再送してください。";

    case "expired":
      return "認証リンクの有効期限が切れています。認証メールを再送してください。";

    case "dashboard":
      return "認証リンクの有効期限が切れています。認証メールを再送してください。";

    default:
      return "メール認証を行ってください。";
  }
}