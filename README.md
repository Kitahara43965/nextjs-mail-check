mac版です。メール認証付アプリのβ版です。<br>
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
<br>
(5) プロジェクト直下に.envファイルを作成します。.envファイルに下記を記載します。<br>
DATABASE_URL=(⭐️)<br>
NEXTAUTH_SECRET=(⭐️⭐️)<br>
NEXTAUTH_URL=http://localhost:3000<br>
<br>
RESEND_API_KEY=(⭐️⭐️⭐️)<br>
RESEND_FROM_EMAIL=onboarding@resend.dev<br>
<br>
\# Mail provider selection<br>
\# Options: mailhog | resend<br>
MAIL_PROVIDER=resend<br>
EMAIL_RESEND_COOLDOWN_MILLISECOND=60000<br>
<br>
(⭐️)DATABASE_URLの値は<br>
Neonのダッシュボードで選択するプロジェクトに入り、connectを選択<br>
そこに表示されるconnecting stringの入力欄の<br>
postgresql:xxxxxxxxxxxxxxxxxxxxx<br>
と出ているものが値です<br>
(⭐️⭐️)NEXTAUTH_SECRETの値は<br>
$ openssl rand -base64 32<br>
と入力してキーの値を取得します。<br>
NEXTAUTH_SECRET="(取得した値)"<br>
とします。<br>
(⭐️⭐️⭐️)RESEND_API_KEYの取得<br>
resendのダッシュボードに入り、API KEYのところに入ります。<br>
そこでAdd API Keyをクリックし、Nameに適切な名前を入力し、<br>
Addを押せばキーの値を取得できます<br>
re_xxxxxxxxxxxxxxxxxxxxx形式のものです<br>
<br>
(6) prismaバージョン変更(prisma ver 5)<br>
$ npm uninstall prisma @prisma/client<br>
$ npm install prisma@5 @prisma/client@5<br>
<br>
(7) データ初期化<br>
⚠️ migrate resetは全てのデータを削除します<br>
$ npx prisma migrate reset<br>
で初期化します。<br>
Are you sure you want to reset your database? All data will be lost.<br>
の質問には小文字でyと入力します。<br>
$ npx prisma db push<br>
とします。<br>
<br>
(8) nodemailerインストール<br>
$ npm install nodemailer<br>
$ npm install -D @types/nodemailer<br>
<br>
(9) サーバー立ち上げ <br>
$ rm -rf .next<br>
$ npm run dev<br>
でサーバーを立ち上げます。<br>
<br>
万が一画面が固まってしまう場合、再度同じurlでページに入っていただければ、動くようになります。<br>
<br>
(*) db可視化のため別途terminal立ち上げます<br>
現在のプロジェクト直下(名称を変更していなければnextjs-email-auth)で<br>
$npx prisma studio<br>
と入力すれば、dbを確認できます。<br>
<br>
登録画面：localhost:3000/register<br>
ログイン画面： localhost:3000/login<br>
ダッシュボード画面：localhost:3000/dashboard<br>
mailhogメール受信画面: localhost:8025<br>
prisma studio(DB確認): http://localhost:5555<br>
