import { logger } from '@/services/logger';
import { exec } from 'child_process';

const IS_DEV = process.env.NODE_ENV !== 'production';
const ENV_NAME = process.env.ENV_NAME;
const LOGGER_TAG = 'LOCKSCREEN';

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
                logger.command(LOGGER_TAG, 'Screen locked');
            }
        },
    );
};

export const lockscreen = (env = 'all') => {
    logger.command(LOGGER_TAG, 'Locking screen');
    logger.command(LOGGER_TAG, 'Env', env);

    if (env === 'all') {
        logger.command(LOGGER_TAG, 'Locking all computers');
        return lock();
    }

    if (env === ENV_NAME) {
        logger.command(LOGGER_TAG, `Locking ${env}`);
        return lock();
    }
};
