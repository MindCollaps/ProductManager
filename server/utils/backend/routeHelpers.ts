import type { H3Event } from 'h3';
import { readBody } from 'h3';
import type { ZodTypeAny } from 'zod';

import { createApiError } from '~~/server/utils/apiResponses';

export function getRequiredRouteId(event: H3Event, message: string): string {
    const { id } = event.context.params || {};

    if (!id) {
        throw createApiError(message, 400);
    }

    return id;
}

export async function getValidatedBody<TSchema extends ZodTypeAny>(event: H3Event, schema: TSchema, invalidMessage: string = 'Invalid input') {
    const body = await readBody(event);
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
        throw createApiError(invalidMessage, 400, validationResult.error.issues);
    }

    return validationResult.data;
}

export async function findRecordOrThrow<T>(finder: () => Promise<T | null>, notFoundMessage: string): Promise<T> {
    const record = await finder();

    if (!record) {
        throw createApiError(notFoundMessage, 404);
    }

    return record;
}

export function pickDefinedFields<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
}
