import { getMailConfig } from '~~/server/utils/mail/config';
import { sendSmtpEmail } from '~~/server/utils/mail/transports/smtp';
import type { MailSendResult, SendEmailInput } from '~~/server/utils/mail/types';

function normalizeRecipients(to: string | string[]) {
    if (Array.isArray(to)) {
        return to;
    }

    return [to];
}

function printEmailToConsole(input: SendEmailInput) {
    console.log('================ MAIL DEBUG START ================');
    console.log(`To: ${ normalizeRecipients(input.to).join(', ') }`);
    console.log(`Subject: ${ input.subject }`);
    console.log('Text Body:');
    console.log(input.text);
    console.log('HTML Body:');
    console.log(input.html);
    console.log('================= MAIL DEBUG END =================');
}

export async function sendEmail(input: SendEmailInput): Promise<MailSendResult> {
    const config = getMailConfig();

    if (!config.enabled) {
        return {
            accepted: [],
            rejected: normalizeRecipients(input.to),
        };
    }

    if (config.printToConsole || config.printOnly) {
        printEmailToConsole(input);
    }

    if (config.printOnly) {
        return {
            accepted: normalizeRecipients(input.to),
            rejected: [],
        };
    }

    if (!config.smtp) {
        throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }

    return sendSmtpEmail(config.smtp, config.from, input);
}
