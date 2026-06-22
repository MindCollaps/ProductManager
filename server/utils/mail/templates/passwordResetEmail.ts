import { renderEmailButton } from '~~/server/utils/mail/components/button';
import { renderEmailLayout } from '~~/server/utils/mail/components/layout';
import type { EmailTemplate } from '~~/server/utils/mail/types';

export interface PasswordResetTemplateInput {
    username: string;
    resetUrl: string;
    validForMinutes: number;
}

export function buildPasswordResetEmail(input: PasswordResetTemplateInput): EmailTemplate {
    const subject = 'Reset your password';

    const html = renderEmailLayout({
        previewText: 'Password reset instructions',
        title: 'Password reset',
        intro: `Hi ${ input.username }, we received a request to reset your password.`,
        contentHtml: `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
  Use the button below to set a new password. This link expires in ${ input.validForMinutes } minutes.
</p>
<div style="margin:0 0 16px;">${ renderEmailButton('Reset password', input.resetUrl) }</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
  If you did not request this, you can ignore this email.
</p>
<p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#64748b;word-break:break-all;">
  ${ input.resetUrl }
</p>`,
    });

    const text = [
        `Hi ${ input.username },`,
        '',
        `Use this link to reset your password (valid for ${ input.validForMinutes } minutes):`,
        input.resetUrl,
        '',
        'If you did not request this, you can ignore this email.',
    ].join('\n');

    return {
        subject,
        html,
        text,
    };
}
