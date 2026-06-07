import Providers from "@/providers";
import { AuthSync } from "@/components/AuthSync";
import Header from "@/components/Header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <AuthSync/>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}