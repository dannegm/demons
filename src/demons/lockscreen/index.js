import { exec } from 'child_process';
import { buildCustomLogger } from '@/services/logger';
import { buildHandler } from '@/helpers/builders';

const IS_DEV = process.env.NODE_ENV === 'development';
const ENV_NAME = process.env.ENV_NAME;
const FEATURE_KEY = 'command.lockscreen';
const logger = buildCustomLogger('lockscreen');

const lock = () => {
    if (IS_DEV) {
        return;
    }

    exec(
        `osascript -e 'tell application "System Events" to key code 12 using {control down, command down}'`,
        error => {
            if (error) {
                logger.error(`Error locking the screen: ${error.message}`);
            } else {
                logger.success('Screen locked');
            }
        },
    );
};

export const lockscreen = buildHandler(FEATURE_KEY, (env = 'all') => {
    logger.info('Locking screen');
    logger.verbose('Env', env);

    if (env === 'all') {
        logger.info('Locking all computers');
        return lock();
    }

    if (env === ENV_NAME) {
        logger.info(`Locking ${env}`);
        return lock();
    }
});
