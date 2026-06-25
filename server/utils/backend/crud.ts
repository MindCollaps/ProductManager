import { createApiError } from '~~/server/utils/apiResponses';
import { findRecordOrThrow, getValidatedBody } from '~~/server/utils/backend/routeHelpers';
import type { H3Event } from 'h3';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';

// Bivariant interface (method shorthand syntax) so Prisma model delegates are
// assignable without resorting to `any`. Strict function types do not apply to
// interface method shorthands, giving us the flexibility we need here.
interface CrudModel {
    findUnique(args: { where: { id: string }; include?: object }): PromiseLike<object | null>;
    findMany(args?: object): PromiseLike<object[]>;
    create(args: object): PromiseLike<object>;
    update(args: object): PromiseLike<object>;
    delete(args: { where: { id: string } }): PromiseLike<object>;
}

type MaybePromise<T> = T | Promise<T>;

type CrudRecord<TModel, TInclude = undefined> = Prisma.Result<
    TModel,
    [TInclude] extends [undefined] ? object : { include: TInclude },
    'findUnique'
>;

type CrudBaseRecord<TModel> = Prisma.Result<TModel, object, 'findUnique'>;

type CrudBody<TSchema extends z.ZodTypeAny> = z.infer<TSchema>;

type CrudListConfig<TModel> = {
    run: (args: { event: H3Event; model: TModel }) => MaybePromise<unknown>;
};

type CrudGetConfig<TModel, TInclude = undefined> = {
    include?: TInclude;
    notFoundMessage?: string;
    // When omitted the record is returned directly.
    run?: (args: { event: H3Event; model: TModel; id: string; record: CrudRecord<TModel, TInclude> }) => MaybePromise<unknown>;
};

type CrudCreateConfig<TModel, TSchema extends z.ZodTypeAny> = {
    schema: TSchema;
    before?: (args: { event: H3Event; model: TModel; body: CrudBody<TSchema> }) => MaybePromise<void>;
    run: (args: { event: H3Event; model: TModel; body: CrudBody<TSchema> }) => MaybePromise<unknown>;
};

type CrudUpdateConfig<TModel, TSchema extends z.ZodTypeAny> = {
    schema: TSchema;
    notFoundMessage?: string;
    before?: (args: { event: H3Event; model: TModel; id: string; record: CrudBaseRecord<TModel>; body: CrudBody<TSchema> }) => MaybePromise<void>;
    run: (args: { event: H3Event; model: TModel; id: string; record: CrudBaseRecord<TModel>; body: CrudBody<TSchema> }) => MaybePromise<unknown>;
};

type CrudDeleteConfig<TModel> = {
    notFoundMessage?: string;
    before?: (args: { event: H3Event; model: TModel; id: string; record: CrudBaseRecord<TModel> }) => MaybePromise<void>;
    // When omitted the model's default delete is used and { message } is returned.
    run?: (args: { event: H3Event; model: TModel; id: string; record: CrudBaseRecord<TModel> }) => MaybePromise<unknown>;
};

type CrudConfig<
    TModel,
    TGetInclude = undefined,
    TCreateSchema extends z.ZodTypeAny | undefined = undefined,
    TUpdateSchema extends z.ZodTypeAny | undefined = undefined,
> = {
    resourceName: string;
    /** Default not-found message shared by all operations unless overridden per-operation. */
    notFoundMessage?: string;
    list?: CrudListConfig<TModel>;
    get?: CrudGetConfig<TModel, TGetInclude>;
    create?: TCreateSchema extends z.ZodTypeAny ? CrudCreateConfig<TModel, TCreateSchema> : never;
    update?: TUpdateSchema extends z.ZodTypeAny ? CrudUpdateConfig<TModel, TUpdateSchema> : never;
    delete?: CrudDeleteConfig<TModel>;
};

export type { CrudBaseRecord, CrudBody, CrudConfig, CrudRecord };

export function crud<
    TModel extends CrudModel,
    TGetInclude = undefined,
    TCreateSchema extends z.ZodTypeAny | undefined = undefined,
    TUpdateSchema extends z.ZodTypeAny | undefined = undefined,
>(model: TModel, config: CrudConfig<TModel, TGetInclude, TCreateSchema, TUpdateSchema>) {
    const defaultNotFound = config.notFoundMessage ?? `${ config.resourceName } not found`;

    function opNotFound(override?: string): string {
        return override ?? defaultNotFound;
    }

    return defineEventHandler(async event => {
        const method = event.method.toUpperCase();
        const { id } = event.context.params || {};

        // ── Collection routes (no id) ────────────────────────────────────────
        if (!id) {
            if (method === 'GET') {
                if (!config.list) {
                    throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
                }
                return config.list.run({ event, model });
            }

            if (method === 'POST') {
                if (!config.create) {
                    throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
                }
                const body = await getValidatedBody(event, config.create.schema);
                await config.create.before?.({ event, model, body });
                return config.create.run({ event, model, body });
            }

            if (method === 'PUT' || method === 'DELETE') {
                throw createApiError(`${ config.resourceName } ID is required`, 400);
            }

            throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
        }

        // ── Single-resource routes (with id) ────────────────────────────────
        if (method === 'GET') {
            const notFound = opNotFound(config.get?.notFoundMessage);

            if (!config.get) {
                const record = await model.findUnique({ where: { id } });
                if (!record) throw createApiError(notFound, 404);
                return record;
            }

            const getConfig = config.get;
            const record = await findRecordOrThrow<CrudRecord<TModel, TGetInclude>>(
                () => model.findUnique(
                    getConfig.include
                        ? { where: { id }, include: getConfig.include as object }
                        : { where: { id } },
                ) as Promise<CrudRecord<TModel, TGetInclude> | null>,
                notFound,
            );

            return getConfig.run
                ? getConfig.run({ event, model, id, record })
                : record;
        }

        // For PUT and DELETE we always fetch the record first.
        const notFound = method === 'PUT'
            ? opNotFound(config.update?.notFoundMessage)
            : opNotFound(config.delete?.notFoundMessage);

        const record = await findRecordOrThrow<CrudBaseRecord<TModel>>(
            () => model.findUnique({ where: { id } }) as Promise<CrudBaseRecord<TModel> | null>,
            notFound,
        );

        if (method === 'PUT') {
            if (!config.update) {
                throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
            }
            const body = await getValidatedBody(event, config.update.schema);
            await config.update.before?.({ event, model, id, record, body });
            return config.update.run({ event, model, id, record, body });
        }

        if (method === 'DELETE') {
            if (!config.delete) {
                throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
            }
            await config.delete.before?.({ event, model, id, record });
            if (config.delete.run) {
                return config.delete.run({ event, model, id, record });
            }
            await model.delete({ where: { id } });
            return { message: `${ config.resourceName } deleted` };
        }

        throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
    });
}
