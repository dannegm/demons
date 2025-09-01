import dns from 'dns';
import EventEmitter from 'events';
import { debounce } from 'lodash';
import { AbortController } from 'abort-controller';

import ntfy from '@/services/ntfy';
import { buildCustomLogger } from '@/services/logger';
import { retry } from '@/helpers/handlers';
import { buildRunner } from '@/helpers/builders';
import { flags } from '@/services/flags';

const ENV_NAME = process.env.ENV_NAME;

const logger = buildCustomLogger('internet');

export const internetStatusEmitter = new EventEmitter();

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
    const previousStatus = await flags.getFlag('state.internet');
    const currentStatus = await checkInternetConnection();

    if (currentStatus !== previousStatus) {
        await flags.setFlag('state.internet', currentStatus);
        internetStatusEmitter.emit('status:change', { status: currentStatus });
    }
};

const sendNotification = debounce(() => {
    retry(
        () =>
            ntfy.push({
                tags: 'globe_with_meridians,green_circle',
                title: `${ENV_NAME} Internet`,
                message: 'Macbook conectada a internet',
            }),
        { delay: 1000 },
    );
}, 60 * 1000);

internetStatusEmitter.on('status:change', async ({ status }) => {
    if (status) {
        logger.info('Internet connected');
        sendNotification();
    } else {
        logger.error('Internet disconnected');
    }
});

export const internetRunner = buildRunner('demon.internet', async () => {
    await monitorInternetConnection();
});
