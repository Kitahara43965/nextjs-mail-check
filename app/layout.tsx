import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/Header";
import AuthBroadcastChannelProvider from "@/components/auth/AuthBroadcastChannelProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="ja">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}