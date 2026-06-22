import { renderEmailButton } from '~~/server/utils/mail/components/button';
import { renderEmailLayout } from '~~/server/utils/mail/components/layout';
import type { EmailTemplate } from '~~/server/utils/mail/types';

export interface AccountVerificationTemplateInput {
    username: string;
    verifyUrl: string;
}

export function buildAccountVerificationEmail(input: AccountVerificationTemplateInput): EmailTemplate {
    const subject = 'Please confirm your account';

    const html = renderEmailLayout({
        previewText: 'Confirm your Product Manager account',
        title: 'Confirm your account',
        intro: `Hi ${ input.username }, please confirm your email to activate your account.`,
        contentHtml: `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
  Thanks for signing up. Click the button below to verify your account.
</p>
<div style="margin:0 0 16px;">${ renderEmailButton('Confirm account', input.verifyUrl) }</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
  If the button does not work, copy and paste this URL into your browser:<br />
  <span style="word-break:break-all;">${ input.verifyUrl }</span>
</p>`,
    });

    const text = [
        `Hi ${ input.username },`,
        '',
        'Thanks for signing up. Please confirm your account by visiting this link:',
        input.verifyUrl,
    ].join('\n');

    return {
        subject,
        html,
        text,
    };
}
