import ntfy from '@/services/ntfy';
import { totp } from '@/services/security';
import { lockscreen } from '@/demons/lockscreen';
import { requestBook } from '@/demons/bookworms';
import { logger } from './services/logger';

// curl -d "command" ntfy.sh/APP_TOPIC

const withAuth = (event, handler) => {
    const data = JSON.parse(event.data);
    const [command, token] = data?.message.split('=').map(s => s.trim());

    if (!token) {
        logger.verbose('No password');
        return false;
    }

    if (totp.validate({ token, window: 1 }) !== 0) {
        logger.error('Invalid OTP');
        return false;
    }

    return handler(command, event);
};

const withParams = handler => {
    return command => {
        const [cmd, ...args] = command.split('::');
        return handler(cmd, ...args);
    };
};

const defaultHandler = () => {
    logger.warn('Comando inválido');
};

const commandHandlers = {
    lockscreen,
    requestBook,
};

export const startListener = () => {
    ntfy.onMessage(event => {
        withAuth(
            event,
            withParams((command, ...args) => {
                logger.debug(`Executando [${command}]`);
                const handler = commandHandlers[command] || defaultHandler;
                return handler(...args);
            }),
        );
    });
};
