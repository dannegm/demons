import { consola } from 'consola';

import { totp } from './security';
import { lockscreen } from './demons/lockscreen';

import ntfy from './ntfy';

// curl -d "command" ntfy.sh/APP_TOPIC

const withAuth = (event, handler) => {
    const data = JSON.parse(event.data);
    const [command, token] = data?.message.split('=').map(s => s.trim());

    if (!token) {
        consola.error('No password');
        return false;
    }

    if (totp.validate({ token, window: 1 }) !== 0) {
        consola.error('Invalid OTP');
        return false;
    }

    return handler(command, event);
};

const defaultHandler = () => {
    consola.log('Comando inválido');
};

const commandHandlers = {
    lockscreen,
};

export const startListener = () => {
    ntfy.onMessage(event => {
        withAuth(event, command => {
            consola.info(`Executando [${command}]`);
            const handler = commandHandlers[command] || defaultHandler;
            return handler();
        });
    });
};
