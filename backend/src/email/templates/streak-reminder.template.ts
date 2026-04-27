export function streakReminderTemplate(
  username: string,
  streak: number,
): { subject: string; html: string } {
  const safeUsername = username?.trim() || 'Learner';

  return {
    subject: `You are on a ${streak}-day streak, keep going`,
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
                    <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Nice momentum, ${safeUsername}!</h1>
                    <p style="margin:0 0 14px;line-height:1.6;">
                      You currently have a <strong>${streak}-day learning streak</strong>.
                      Keep the chain alive with one quick lesson this week.
                    </p>
                    <p style="margin:0;line-height:1.6;">
                      Small progress every week leads to real mastery.
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
