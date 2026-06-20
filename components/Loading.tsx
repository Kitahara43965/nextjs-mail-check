"use client";

import { LoadingKind} from "@/enums/loading-kind.enum";

type Props = {
  loadingKind: LoadingKind;
};

export default function Loading({ loadingKind }: Props) {
  switch (loadingKind) {
      case LoadingKind.UNDEFINED:
        return <p>待機中です...</p>
      case LoadingKind.LOADING:
        return <p>読み込み中です...</p>
      case LoadingKind.AUTHENTICATED:
        return <p>認証中です...</p>;
      case LoadingKind.IS_VERIFICATION_CHECKED_FALSE:
        return <p>認証確認中...</p>
      default:
        return <p>loading...</p>;
    }
}