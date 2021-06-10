import { createTransport, getTestMessageUrl } from 'nodemailer';

const transport = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function makeANiceEmail(text: string) {
  return `
        <div style="
            border: 1px solid black;
            padding: 20px;
            font-family: sans-serif;
            line-height: 20px;
        ">
            <h2>${text}</h2>
            <p>😘, Jared</p>
        </div>
    `;
}

interface Envelope {
  from: string;
  to?: string[] | null;
}

interface MailResponse {
  accepted?: string[] | null;
  rejected?: null[] | null;
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: Envelope;
  messageId: string;
}

export async function sendPasswordResetEmail(
  resetToken: string,
  to: string
): Promise<void> {
  // emil the user a token
  const info = (await transport.sendMail({
    to,
    from: 'test@example.com',
    subject: 'Your password reset token!',
    html: makeANiceEmail(`You password reset token is here! ✅
        
        <a href="${process.env.FRONTEND_URL}/reset?token=${resetToken}">Reset Password</a>    
     `),
  })) as MailResponse;
  if (process.env.MAIL_USER.includes('ethereal.email')) {
    console.log(`💌 Message sent! Preview it at ${getTestMessageUrl(info)}`);
  }
}

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  // emil the user a token
  const info = (await transport.sendMail({
    to,
    from: 'test@example.com',
    subject: 'Welcome, welcome, welcome!',
    html: makeANiceEmail(`Welcome ${name}! ❤️ Your email is ${to}`),
  })) as MailResponse;
  if (process.env.MAIL_USER.includes('ethereal.email')) {
    console.log(`💌 Message sent! Preview it at ${getTestMessageUrl(info)}`);
  }
}
