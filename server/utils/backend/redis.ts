import IORedis from 'ioredis';

export function getRedis() {
    return new IORedis({
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: 6379,
        family: 4,
        db: 0,
        maxRetriesPerRequest: null,
        autoResubscribe: true,
    });
}

export const redisClient = getRedis();

export function getRedisSync(key: string) {
    return new Promise<string | null | undefined>((resolve, reject) => redisClient.get(key, (err, result) => {
        if (err) return reject(err);
        resolve(result);
    }));
}

export type RedisDataGet<T extends Record<string, any> | any[], D extends T | null = null> = () => Promise<T | D>;

export function setRedisSync(key: string, data: string, expireIn: number) {
    return new Promise<void>((resolve, reject) => redisClient.set(key, data, 'PX', expireIn, (err, result) => {
        if (err) return reject(err);
        resolve();
    }));
}

export function expireRedisSync(key: string, expireIn: number) {
    return new Promise<void>((resolve, reject) => redisClient.pexpire(key, expireIn, err => {
        if (err) return reject(err);
        resolve();
    }));
}

export function unsetRedisSync(key: string) {
    return new Promise<void>((resolve, reject) => redisClient.del(key, (err, result) => {
        if (err) return reject(err);
        resolve();
    }));
}
