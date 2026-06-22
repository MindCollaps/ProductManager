export interface EmailAddress {
    email: string;
    name?: string;
}

export interface SendEmailInput {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface MailSendResult {
    accepted: string[];
    rejected: string[];
    messageId?: string;
}

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

export interface MailConfig {
    enabled: boolean;
    from: string;
    appBaseUrl: string;
    printToConsole: boolean;
    printOnly: boolean;
    smtp: SmtpConfig | null;
    digestIntervalMinutes: number;
    digestLockTtlMs: number;
}
