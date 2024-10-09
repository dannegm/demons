import dns from 'dns';
import EventEmitter from 'events';
import { AbortController } from 'abort-controller';
import ntfy from '@/services/ntfy';
import { buildCustomLogger } from '@/services/logger';
import { retry } from '@/helpers/handlers';
import { buildRunner } from '@/helpers/builders';

const ENV_NAME = process.env.ENV_NAME;
const FEATURE_KEY = 'demon.internet';

const logger = buildCustomLogger('internet');

export const internetStatusEmitter = new EventEmitter();

let previousStatus = null;

const checkInternetConnection = (timeout = 3000) => {
    return new Promise(resolve => {
        const controller = new AbortController();

        const timer = setTimeout(() => {
            if (!controller.signal.aborted) {
                controller.abort();
                resolve(false);
            }
        }, timeout);

        dns.resolve('www.google.com', err => {
            clearTimeout(timer);
            if (!controller.signal.aborted) {
                controller.abort();
                resolve(!err);
            }
        });
    });
};

const monitorInternetConnection = async () => {
    const currentStatus = await checkInternetConnection();

    if (currentStatus !== previousStatus) {
        previousStatus = currentStatus;
        internetStatusEmitter.emit('status:change', { status: currentStatus });
    }
};

internetStatusEmitter.on('status:change', async ({ status }) => {
    if (status) {
        logger.info('Internet connected');
        retry(
            () =>
                ntfy.push({
                    tags: 'globe_with_meridians,green_circle',
                    title: `${ENV_NAME} Internet`,
                    message: 'Macbook conectada a internet',
                }),
            { delay: 1000 },
        );
    } else {
        logger.error('Internet disconnected');
    }
});

export const internetRunner = buildRunner(FEATURE_KEY, async () => {
    await monitorInternetConnection();
});
