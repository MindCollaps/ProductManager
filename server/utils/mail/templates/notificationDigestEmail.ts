import { renderEmailButton } from '~~/server/utils/mail/components/button';
import { renderEmailListItem } from '~~/server/utils/mail/components/list';
import { renderEmailLayout } from '~~/server/utils/mail/components/layout';
import type { EmailTemplate } from '~~/server/utils/mail/types';

export interface NotificationDigestItem {
    id: string;
    subject: string;
    body: string;
    createdAt: Date;
}

export interface NotificationDigestTemplateInput {
    username: string;
    notifications: NotificationDigestItem[];
    notificationsUrl: string;
}

function formatDate(value: Date) {
    return value.toISOString().replace('T', ' ').slice(0, 16);
}

export function buildNotificationDigestEmail(input: NotificationDigestTemplateInput): EmailTemplate {
    const count = input.notifications.length;
    const subject = `Notification summary (${ count })`;

    const listHtml = input.notifications
        .slice(0, 10)
        .map(item => renderEmailListItem(item.subject, item.body, formatDate(item.createdAt)))
        .join('');

    const overflowCount = Math.max(0, count - 10);

    const overflowText = overflowCount > 0
        ? `<p style="margin:0 0 12px;font-size:13px;color:#475569;">And ${ overflowCount } more notifications.</p>`
        : '';

    const html = renderEmailLayout({
        previewText: `You have ${ count } new notifications`,
        title: 'Notification summary',
        intro: `Hi ${ input.username }, here is a summary of your latest notifications.`,
        contentHtml: `
<div style="margin:0 0 10px;">${ listHtml }</div>
${ overflowText }
<div>${ renderEmailButton('Open notifications', input.notificationsUrl) }</div>`,
    });

    const textItems = input.notifications
        .slice(0, 10)
        .map(item => ['- ', item.subject, ': ', item.body, ' (', formatDate(item.createdAt), ')'].join(''))
        .join('\n');

    const text = [
        `Hi ${ input.username },`,
        '',
        `You have ${ count } new notifications.`,
        textItems,
        overflowCount > 0 ? `And ${ overflowCount } more notifications.` : '',
        '',
        `Open notifications: ${ input.notificationsUrl }`,
    ].filter(Boolean).join('\n');

    return {
        subject,
        html,
        text,
    };
}
