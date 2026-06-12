import { createApiError } from '~~/server/utils/apiResponses';
import { findRecordOrThrow, getValidatedBody } from '~~/server/utils/backend/routeHelpers';
import type { H3Event } from 'h3';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';

function getRecordNotFoundMessage(config: any) {
    return config.update?.notFoundMessage ||
        config.delete?.notFoundMessage ||
        config.get?.notFoundMessage ||
        `${ config.resourceName } not found`;
}

type CrudModel = {
    findUnique: (...args: any[]) => any;
    findMany: (...args: any[]) => any;
    create: (...args: any[]) => any;
    update: (...args: any[]) => any;
    delete: (...args: any[]) => any;
};

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
    run: (args: { event: H3Event; model: TModel; id: string; record: CrudRecord<TModel, TInclude> }) => MaybePromise<unknown>;
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
    run: (args: { event: H3Event; model: TModel; id: string; record: CrudBaseRecord<TModel> }) => MaybePromise<unknown>;
};

type CrudConfig<TModel, TGetInclude = undefined, TCreateSchema extends z.ZodTypeAny | undefined = undefined, TUpdateSchema extends z.ZodTypeAny | undefined = undefined> = {
    resourceName: string;
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
    return defineEventHandler(async event => {
        const method = event.method.toUpperCase();
        const { id } = event.context.params || {};

        if (!id) {
            if (method === 'GET') {
                if (!config.list) {
                    throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
                }

                return config.list.run({
                    event,
                    model,
                });
            }

            if (method === 'POST') {
                if (!config.create) {
                    throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
                }

                const body = await getValidatedBody(event, config.create.schema);
                await config.create.before?.({
                    event,
                    model,
                    body,
                });

                return config.create.run({
                    event,
                    model,
                    body,
                });
            }

            if (method === 'PUT' || method === 'DELETE') {
                throw createApiError(`${ config.resourceName } ID is required`, 400);
            }

            throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
        }

        if (method === 'GET') {
            if (!config.get) {
                const record = await model.findUnique({
                    where: { id },
                });

                if (!record) {
                    throw createApiError(`${ config.resourceName } not found`, 404);
                }

                return record;
            }

            const getConfig = config.get;

            const record = await findRecordOrThrow<CrudRecord<TModel, TGetInclude>>(
                () => model.findUnique(getConfig.include
                    ? {
                        where: { id },
                        include: getConfig.include,
                    }
                    : {
                        where: { id },
                    }),
                getConfig.notFoundMessage || `${ config.resourceName } not found`,
            );

            return config.get.run({
                event,
                model,
                id,
                record,
            });
        }

        const record = await findRecordOrThrow<CrudBaseRecord<TModel>>(
            () => model.findUnique({
                where: { id },
            }),
            getRecordNotFoundMessage(config),
        );

        if (method === 'PUT') {
            if (!config.update) {
                throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
            }

            const body = await getValidatedBody(event, config.update.schema);
            await config.update.before?.({
                event,
                model,
                id,
                record,
                body,
            });

            return config.update.run({
                event,
                model,
                id,
                record,
                body,
            });
        }

        if (method === 'DELETE') {
            if (!config.delete) {
                throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
            }

            await config.delete.before?.({
                event,
                model,
                id,
                record,
            });

            return config.delete.run({
                event,
                model,
                id,
                record,
            });
        }

        throw createApiError(`Method ${ method } is not allowed for ${ config.resourceName }`, 405);
    });
}
