import ntfy from '@/services/ntfy';
import { buildCustomLogger } from '@/services/logger';
import { buildHandler } from '@/helpers/builders';

const ENV_NAME = process.env.ENV_NAME;
const logger = buildCustomLogger('pingpong');

export const ping = buildHandler('command.pingpong', async () => {
    logger.info('Ping');

    await ntfy.push({
        tags: 'green_circle',
        title: `${ENV_NAME} Pong`,
        message: '',
    });

    logger.success('Pong sent.');
});
