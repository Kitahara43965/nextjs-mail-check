import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
});

export async function sendEmail(
  email:string,
  stringUrl:string,
  stringSubject:string,
  stringHtml:string,
){
  let stringResendFromEmail:string|null = null;
  let stringResendApiKey:string|null = null;
  let stringMailProvider:string|null = null;

  if(process.env.RESEND_FROM_EMAIL){
    stringResendFromEmail = process.env.RESEND_FROM_EMAIL;
  }//process.env.RESEND_FROM_EMAIL
  if(process.env.RESEND_API_KEY){
    stringResendApiKey = process.env.RESEND_API_KEY;
  }//process.env.RESEND_API_KEY
  if(process.env.MAIL_PROVIDER){
    stringMailProvider = process.env.MAIL_PROVIDER;
  }//process.env.MAIL_PROVIDER

  if(stringMailProvider === "resend"){
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stringResendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: stringResendFromEmail,
        to: email,
        subject: stringSubject,
        html: stringHtml,
      }),
    });
  }else{//stringMailProvider
    
    await transporter.sendMail({
      from: "test@example.com",
      to: email,
      subject: stringSubject,
      html: stringHtml,
    });
  }//stringMailProvider

}