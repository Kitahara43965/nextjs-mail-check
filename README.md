mac版です。<br>
$はターミナルに入力する内容です。<br>
(1) git cloneします。<br>
$ git clone git@github.com:Kitahara43965/nextjs-mail-check.git<br>
<br>
(2) nextjs-mail-checkディレクトリに移動<br>
$ cd nextjs-mail-check<br>
<br>
(3) nextをインストールします<br>
$ npm install<br>
<br>
(4) postgresql起動<br>
$ brew services start postgresql<br>
(5) (ローカルの場合のみ)postgresqlデータベース作成<br>
$ createuser myuser -P<br>
$ createdb myapp -O myuser <br>
「新しいロールのためのパスワード」、「もう一度入力してください」ではパスワードは任意<br>
myuserに権限をつける<br>
$ psql myapp<br>
$ GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;<br>
$ exit<br>
<br>
(6) プロジェクト直下に<br>
$cp .env.example .env<br>
と入力し、.envファイルを作成します。.envファイルに下記を記載します。<br>
DATABASE_URLはlocal版に対応<br>
<br>
DATABASE_URL=postgresql://myuser:password@localhost:5432/myapp<br>
NEXTAUTH_SECRET=(⭐️)<br>
NEXTAUTH_URL=http://localhost:3000<br>
<br>
RESEND_API_KEY=(⭐️⭐️)<br>
RESEND_FROM_EMAIL=onboarding@resend.dev<br>
<br>
\# 本番環境ではSTMP_...はございません。<br>
SMTP_HOST=localhost<br>
SMTP_PORT=1025<br>
SMTP_USER=test@example.com<br>
SMTP_PASS=<br>
<br>
\# Mail provider selection<br>
\# mailhog/resend 本番ではresend<br>
MAIL_PROVIDER=mailhog<br>
EMAIL_RESEND_COOLDOWN_MILLISECOND=60000<br>
<br>
(⭐️)NEXTAUTH_SECRETの値は<br>
$ openssl rand -base64 32<br>
と入力してキーの値を取得します。<br>
NEXTAUTH_SECRET=取得した値<br>
とします。<br>
(⭐️⭐️)RESEND_API_KEYの取得<br>
resend::https://resend.com/emails<br>
resendのダッシュボードに入り、API keysのところに入ります。<br>
そこでAdd API Keyをクリックし、Nameに適切な名前を入力し、<br>
Addを押せばキーの値を取得できます<br>
re_xxxxxxxxxxxxxxxxxxxxx形式のものです<br>
<br>
(7) prismaバージョン変更(prisma ver 5)<br>
$ npm uninstall prisma @prisma/client<br>
$ npm install prisma@5 @prisma/client@5<br>
<br>
(8) データ初期化<br>
⚠️ migrate resetは全てのデータを削除します<br>
$ npx prisma migrate reset<br>
で初期化します。<br>
Are you sure you want to reset your database? All data will be lost.<br>
の質問には小文字でyと入力します。<br>
$ npx prisma db push<br>
とします。<br>
<br>
(9) nodemailerインストール<br>
$ npm install nodemailer<br>
$ npm install -D @types/nodemailer<br>
<br>
(10) mailhog起動のために別途terminalを立ち上げます<br>
この項目は.env
現在のプロジェクト直下(名称を変更していなければnextjs-email-auth)で<br>
mailhogをインストールしていない場合はbrew経由でインストール<br>
$ brew install go<br>
$ go install github.com/mailhog/MailHog@latest<br>
$ export PATH=$PATH:$(go env GOPATH)/bin<br>
以下のコマンドでmailhog立ち上げ<br>
$ mailhog<br>
<br>
(11) サーバー立ち上げ <br>
$ rm -rf .next<br>
$ npm run dev<br>
でサーバーを立ち上げます。<br>
<br>
万が一画面が固まってしまう場合、再度同じurlでページに入っていただければ、動くようになります。<br>
<br>
(12) db可視化のため別途terminal立ち上げます<br>
現在のプロジェクト直下(名称を変更していなければnextjs-email-auth)で<br>
$npx prisma studio<br>
と入力すれば、dbを確認できます。<br>
<br>
<br>■ 開発環境
<br>MailHogを使用（ローカルメール確認）
<br>
<br>■ 本番環境
<br>Resendで送信可能
<br>環境変数で切り替え
<br>
(13)アーキテクチャ図<br>
User<br>
 ↓（HTTPS / DNS管理・セキュリティ）<br>
Cloudflare<br>
 ↓（SSR + API統合）<br>
Vercel（Next.js）<br>
 ↓（認証・業務データ）<br>
PostgreSQL<br>
<br>

登録画面：localhost:3000/register<br>
ログイン画面： localhost:3000/login<br>
ダッシュボード画面：localhost:3000/dashboard<br>
mailhogメール受信画面: localhost:8025<br>
prisma studio(DB確認): http://localhost:5555<br>
