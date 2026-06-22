import nodemailer from 'nodemailer';

import type { MailSendResult, SendEmailInput, SmtpConfig } from '~~/server/utils/mail/types';

type AddressLike = {
    address: string;
};

const transportCache = new Map<string, nodemailer.Transporter>();

function getTransportKey(config: SmtpConfig) {
    return `${ config.host }:${ config.port }:${ config.user }:${ config.secure ? 'secure' : 'starttls' }`;
}

function getTransport(config: SmtpConfig) {
    const cacheKey = getTransportKey(config);
    const cached = transportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    transportCache.set(cacheKey, transport);

    return transport;
}

export async function sendSmtpEmail(config: SmtpConfig, from: string, input: SendEmailInput): Promise<MailSendResult> {
    const transport = getTransport(config);

    const result = await transport.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
    });

    const accepted = result.accepted.map((item: string | AddressLike) => {
        return typeof item === 'string' ? item : item.address;
    });

    const rejected = result.rejected.map((item: string | AddressLike) => {
        return typeof item === 'string' ? item : item.address;
    });

    return {
        accepted,
        rejected,
        messageId: result.messageId,
    };
}
