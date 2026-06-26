import { renderEmailButton } from '../components/button';
import { renderEmailLayout } from '../components/layout';
import type { EmailTemplate } from '../types';

export interface RepairReceivedTemplateInput {
    customerName: string;
    requestSubject: string;
    requestUrl: string;
}

export function buildRepairReceivedEmail(input: RepairReceivedTemplateInput): EmailTemplate {
    const subject = `We've received your device – ${ input.requestSubject }`;

    const html = renderEmailLayout({
        previewText: 'Your device has arrived at our workshop',
        title: 'Device received',
        intro: `Hi ${ input.customerName }, your device has arrived at our workshop.`,
        contentHtml: `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
  We have received your device and our team will start working on it shortly. You can track the repair progress in real time.
</p>
<div>${ renderEmailButton('Track repair', input.requestUrl) }</div>`,
    });

    const text = [
        `Hi ${ input.customerName },`,
        '',
        'Your device has arrived at our workshop.',
        'Our team will start working on it shortly.',
        '',
        `Track your repair: ${ input.requestUrl }`,
    ].join('\n');

    return { subject, html, text };
}
