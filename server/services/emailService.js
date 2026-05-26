import nodemailer from "nodemailer";

// Create email transporter
// Using Gmail — go to Google Account → Security → App Passwords
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  No email credentials — emails will be logged only");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password, not your Gmail password
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(`📧 [No Email] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transport.sendMail({
      from: `"Gracia Fab Beauty" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    throw err; // Rethrow so BullMQ can retry
  }
};

// ── Email templates
export const emailTemplates = {
  orderConfirmed: (name, orderId, total, items) => ({
    subject: `✅ Order Confirmed — #${orderId} | Gracia Fab`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #14213D, #1C2E52); padding: 32px; text-align: center;">
          <h1 style="color: #FCA311; font-style: italic; margin: 0;">Gracia Fab</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Your beauty order is confirmed!</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #FCA311;">Hi ${name}! ✨</h2>
          <p style="color: rgba(255,255,255,0.8);">Your order has been confirmed and is being prepared.</p>
          <div style="background: #14213D; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0 0 8px;">ORDER NUMBER</p>
            <p style="color: #FCA311; font-size: 20px; font-weight: bold; margin: 0;">#${orderId}</p>
          </div>
          <div style="border-top: 1px solid #14213D; padding-top: 20px;">
            ${(items || [])
              .map(
                (item) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: rgba(255,255,255,0.8);">${item.name} × ${item.quantity}</span>
                <span style="color: #FCA311;">₦${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `,
              )
              .join("")}
            <div style="border-top: 1px solid #14213D; padding-top: 12px; display: flex; justify-content: space-between;">
              <strong style="color: #fff;">Total</strong>
              <strong style="color: #FCA311; font-size: 18px;">₦${total.toLocaleString()}</strong>
            </div>
          </div>
          <div style="text-align: center; margin-top: 32px;">
            <a href="https://gracia-fab.vercel.app/my-orders"
               style="background: #FCA311; color: #000; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Track My Order
            </a>
          </div>
        </div>
        <div style="background: #14213D; padding: 20px; text-align: center;">
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
            © 2026 Gracia Fab Beauty · Nigeria · gracia-fab.vercel.app
          </p>
        </div>
      </div>
    `,
  }),

  orderShipped: (name, orderId) => ({
    subject: `🚚 Your Order is on its Way! #${orderId} | Gracia Fab`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #14213D, #1C2E52); padding: 32px; text-align: center;">
          <h1 style="color: #FCA311; font-style: italic;">Gracia Fab</h1>
          <div style="font-size: 48px;">🚚</div>
          <h2 style="color: #fff;">Your order is shipped!</h2>
        </div>
        <div style="padding: 32px; color: rgba(255,255,255,0.8);">
          <p>Hi <strong style="color: #FCA311;">${name}</strong>!</p>
          <p>Great news! Your Gracia Fab order <strong>#${orderId}</strong> has been shipped and is on its way to you.</p>
          <p>Expected delivery: <strong style="color: #FCA311;">2–5 business days</strong></p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://gracia-fab.vercel.app/my-orders"
               style="background: #FCA311; color: #000; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Track Order
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  welcome: (name) => ({
    subject: `💄 Welcome to Gracia Fab, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FE938C, #C49792); padding: 40px; text-align: center;">
          <h1 style="color: #fff; font-style: italic; font-size: 36px; margin: 0;">Gracia Fab</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 18px;">AI-Powered Beauty for You</p>
        </div>
        <div style="padding: 32px; color: rgba(255,255,255,0.8);">
          <h2 style="color: #FCA311;">Welcome, ${name}! ✨</h2>
          <p>You've joined Nigeria's premier AI-powered beauty community.</p>
          <ul style="line-height: 2; color: rgba(255,255,255,0.7);">
            <li>✦ Get personalized skincare recommendations</li>
            <li>✦ Shop premium beauty products</li>
            <li>✦ Earn loyalty points on every purchase</li>
            <li>✦ Exclusive offers for members</li>
          </ul>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://gracia-fab.vercel.app/recommend"
               style="background: #FCA311; color: #000; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Get My AI Recommendations →
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};
