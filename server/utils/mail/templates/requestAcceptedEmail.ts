import { renderEmailButton } from '~~/server/utils/mail/components/button';
import { renderEmailLayout } from '~~/server/utils/mail/components/layout';
import type { EmailTemplate } from '~~/server/utils/mail/types';

export interface RequestAcceptedTemplateInput {
    customerName: string;
    subject: string;
    requestUrl: string;
}

export function buildRequestAcceptedEmail(input: RequestAcceptedTemplateInput): EmailTemplate {
    const subject = `Your repair request has been accepted: ${ input.subject }`;

    const html = renderEmailLayout({
        previewText: 'Your repair request has been accepted',
        title: 'Request accepted',
        intro: `Hi ${ input.customerName }, we have accepted your repair request.`,
        contentHtml: `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
  Your request is now in our queue and will be processed shortly. You can track the status and receive updates in real time.
</p>
<div>${ renderEmailButton('View request', input.requestUrl) }</div>`,
    });

    const text = [
        `Hi ${ input.customerName },`,
        '',
        'We have accepted your repair request and it is now in our processing queue.',
        '',
        `View your request: ${ input.requestUrl }`,
    ].join('\n');

    return {
        subject,
        html,
        text,
    };
}
