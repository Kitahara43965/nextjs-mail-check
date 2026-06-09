export function getVerifyMessage(
  reason: string | null,
): string {
  switch (reason) {

    case "invalid":
      return "認証リンクが無効です。認証メールを再送してください。";

    case "expired":
      return "認証リンクの有効期限が切れています。認証メールを再送してください。";

    default:
      return "ご登録時および認証ページ表示時に、メールを送信しています。";
  }
}