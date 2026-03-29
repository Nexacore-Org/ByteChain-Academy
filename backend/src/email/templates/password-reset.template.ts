export function passwordResetTemplate(resetUrl: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Reset your ByteChain Academy password',
    html: `
      <div style="margin:0;padding:0;background:#f3f8f4;font-family:Arial,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#0f8f4f;color:#ffffff;padding:20px 24px;font-size:24px;font-weight:700;">
                    ByteChain Academy
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Password reset request</h1>
                    <p style="margin:0 0 16px;line-height:1.6;">
                      We received a request to reset your password. Click the button below to continue.
                    </p>
                    <p style="margin:20px 0;">
                      <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">
                        Reset password
                      </a>
                    </p>
                    <p style="margin:0;line-height:1.6;font-size:14px;color:#4b5563;">
                      If you did not request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  };
}
