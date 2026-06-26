import { renderEmailButton } from '../components/button';
import { renderEmailLayout } from '../components/layout';
import type { EmailTemplate } from '../types';

export interface PackageShippedTemplateInput {
    customerName: string;
    requestSubject: string;
    requestUrl: string;
}

export function buildPackageShippedEmail(input: PackageShippedTemplateInput): EmailTemplate {
    const subject = `Your device is on its way – ${ input.requestSubject }`;

    const html = renderEmailLayout({
        previewText: 'Your repaired device has been shipped',
        title: 'Device shipped',
        intro: `Hi ${ input.customerName }, your repaired device is on its way to you.`,
        contentHtml: `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
  We have shipped your device and it should arrive shortly. You can view the full repair details and history in your account.
</p>
<div>${ renderEmailButton('View request', input.requestUrl) }</div>`,
    });

    const text = [
        `Hi ${ input.customerName },`,
        '',
        'Your repaired device has been shipped and is on its way to you.',
        '',
        `View your request: ${ input.requestUrl }`,
    ].join('\n');

    return { subject, html, text };
}
