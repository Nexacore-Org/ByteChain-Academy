export function certificateTemplate(
  username: string,
  courseName: string,
  certificateHash: string,
): { subject: string; html: string } {
  const safeUsername = username?.trim() || 'Learner';

  return {
    subject: `Your ${courseName} certificate is ready`,
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
                    <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Congratulations, ${safeUsername}!</h1>
                    <p style="margin:0 0 12px;line-height:1.6;">
                      You have successfully completed <strong>${courseName}</strong>.
                    </p>
                    <p style="margin:0 0 20px;line-height:1.6;">
                      Your certificate is now available for download and verification.
                    </p>
                    <p style="margin:0 0 12px;">
                      <strong>Your certificate is attached to this email as a PDF file.</strong>
                    </p>
                    <p style="margin:0;line-height:1.6;font-size:14px;color:#4b5563;">
                      Verification hash: <code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">${certificateHash}</code>
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
