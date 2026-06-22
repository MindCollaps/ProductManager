import { renderEmailButton } from '~~/server/utils/mail/components/button';
import { renderEmailLayout } from '~~/server/utils/mail/components/layout';
import type { EmailTemplate } from '~~/server/utils/mail/types';

export interface NewRequestAlertTemplateInput {
    requestId: string;
    customerName: string;
    subject: string;
    problemDescription: string;
    requestUrl: string;
}

export function buildNewRequestAlertEmail(input: NewRequestAlertTemplateInput): EmailTemplate {
    const subject = `New repair request: ${ input.subject }`;

    const html = renderEmailLayout({
        previewText: 'A new repair request was created',
        title: 'New repair request',
        intro: `${ input.customerName } submitted a new repair request.`,
        contentHtml: `
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;"><strong>Request:</strong> ${ input.subject }</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;"><strong>ID:</strong> ${ input.requestId }</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;"><strong>Problem:</strong> ${ input.problemDescription }</p>
<div style="margin:0 0 14px;">${ renderEmailButton('Open request', input.requestUrl) }</div>`,
    });

    const text = [
        'A new repair request was created.',
        `Request: ${ input.subject }`,
        `Request ID: ${ input.requestId }`,
        `Customer: ${ input.customerName }`,
        `Problem: ${ input.problemDescription }`,
        `Open: ${ input.requestUrl }`,
    ].join('\n');

    return {
        subject,
        html,
        text,
    };
}
