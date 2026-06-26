import { buildAccountVerificationEmail } from './templates/accountVerificationEmail';
import { buildPasswordResetEmail } from './templates/passwordResetEmail';
import { buildNewRequestAlertEmail } from './templates/newRequestAlertEmail';
import { buildRequestAcceptedEmail } from './templates/requestAcceptedEmail';
import { buildRepairReceivedEmail } from './templates/repairReceivedEmail';
import { buildPackageShippedEmail } from './templates/packageShippedEmail';
import { buildNotificationDigestEmail } from './templates/notificationDigestEmail';
import { sendEmail } from './client';
import { getMailConfig } from './config';

export interface NotificationDigestEmailItem {
    id: string;
    subject: string;
    body: string;
    createdAt: Date;
}

export async function sendAccountVerificationEmail(email: string, username: string, verifyUrl: string): Promise<void> {
    const template = buildAccountVerificationEmail({
        username,
        verifyUrl,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendPasswordResetEmail(
    email: string,
    username: string,
    resetUrl: string,
    validForMinutes: number,
): Promise<void> {
    const template = buildPasswordResetEmail({
        username,
        resetUrl,
        validForMinutes,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendNewRequestAlertEmail(
    email: string,
    requestId: string,
    customerName: string,
    subject: string,
    problemDescription: string,
): Promise<void> {
    const config = getMailConfig();
    const requestUrl = `${ config.appBaseUrl }/staff/request/${ requestId }`;
    const template = buildNewRequestAlertEmail({
        requestId,
        customerName,
        subject,
        problemDescription,
        requestUrl,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendRequestAcceptedEmail(
    email: string,
    customerName: string,
    subject: string,
    requestId: string,
): Promise<void> {
    const config = getMailConfig();
    const requestUrl = `${ config.appBaseUrl }/request/${ requestId }`;
    const template = buildRequestAcceptedEmail({
        customerName,
        subject,
        requestUrl,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendRepairReceivedEmail(
    email: string,
    customerName: string,
    requestSubject: string,
    requestUrl: string,
): Promise<void> {
    const template = buildRepairReceivedEmail({ customerName, requestSubject, requestUrl });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendPackageShippedEmail(
    email: string,
    customerName: string,
    requestSubject: string,
    requestUrl: string,
): Promise<void> {
    const template = buildPackageShippedEmail({ customerName, requestSubject, requestUrl });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendNotificationDigestEmail(
    email: string,
    username: string,
    notifications: NotificationDigestEmailItem[],
): Promise<void> {
    const config = getMailConfig();
    const template = buildNotificationDigestEmail({
        username,
        notifications,
        notificationsUrl: `${ config.appBaseUrl }/dashboard`,
    });

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}
