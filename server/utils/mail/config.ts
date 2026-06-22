import type { MailConfig, SmtpConfig } from '~~/server/utils/mail/types';

function parseBoolean(value: string | undefined, fallback: boolean) {
    if (!value) {
        return fallback;
    }

    return value.toLowerCase() === 'true' || value === '1';
}

function parseNumber(value: string | undefined, fallback: number) {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

function getSmtpConfig(): SmtpConfig | null {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
        return null;
    }

    return {
        host,
        port: parseNumber(process.env.SMTP_PORT, 587),
        secure: parseBoolean(process.env.SMTP_SECURE, false),
        user,
        pass,
    };
}

export function getMailConfig(): MailConfig {
    const smtp = getSmtpConfig();
    const printToConsole = parseBoolean(process.env.MAIL_PRINT_TO_CONSOLE, false);
    const printOnly = parseBoolean(process.env.MAIL_PRINT_ONLY, false);

    return {
        enabled: smtp !== null || printToConsole || printOnly,
        from: process.env.MAIL_FROM?.trim() || 'Product Manager <no-reply@example.com>',
        appBaseUrl: process.env.APP_BASE_URL?.trim() || 'http://localhost:8080',
        printToConsole,
        printOnly,
        smtp,
        digestIntervalMinutes: parseNumber(process.env.NOTIFICATION_DIGEST_INTERVAL_MINUTES, 30),
        digestLockTtlMs: parseNumber(process.env.NOTIFICATION_DIGEST_LOCK_TTL_MS, 5 * 60 * 1000),
    };
}
