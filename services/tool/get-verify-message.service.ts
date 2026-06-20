export function getVerifyMessage(
  reason: string | null,
): string {
  switch (reason) {

    case "login":
      return "ログインしました。認証メールを確認してください。";

    case "before_server_component_from_dashboard_after_login":
      return "ログインしました。認証メールを確認してください。";

    case "register":
      return "会員登録しました。認証メールを確認してください。";

    case "invalid":
      return "認証リンクが無効です。認証メールを再送してください。";

    case "expired":
      return "認証リンクの有効期限が切れています。認証メールを再送してください。";

    default:
      return "メールを再送信してください。";
  }
}