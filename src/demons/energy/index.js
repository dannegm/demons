import { exec } from 'child_process';
import EventEmitter from 'events';
import ntfy from '@/services/ntfy';
import { logger } from '@/services/logger';

const ENV_NAME = process.env.ENV_NAME;
const LOGGER_TAG = 'ENERGY';

export const powerStatusEmitter = new EventEmitter();

let previousStatus = null;

const checkPowerStatus = () => {
    return new Promise((resolve, reject) => {
        exec('pmset -g batt', (error, stdout, stderr) => {
            if (error) {
                logger.error(LOGGER_TAG, error.message);
                return reject(error);
            }
            if (stderr) {
                logger.error(LOGGER_TAG, `Stderr: ${stderr}`);
                return reject(stderr);
            }

            const isConnectedToPower = stdout.includes('AC Power');
            resolve(isConnectedToPower);
        });
    });
};

const monitorPowerStatus = async () => {
    const currentStatus = await checkPowerStatus();

    if (currentStatus !== previousStatus) {
        previousStatus = currentStatus;
        powerStatusEmitter.emit('status:change', { status: currentStatus });
    }
};

powerStatusEmitter.on('status:change', async ({ status }) => {
    if (status) {
        logger.demon(LOGGER_TAG, 'Power connected.');
        await ntfy.push({
            tags: 'battery,green_circle',
            title: `${ENV_NAME} Power`,
            message: 'Macbook conectada a la corriente elétrica',
        });
    } else {
        logger.demon(LOGGER_TAG, 'Power disconnected.');
        await ntfy.push({
            tags: 'battery,red_circle',
            title: `${ENV_NAME} Power`,
            message: 'Macbook desconectada a la corriente elétrica',
        });
    }
});

export const energyRunner = async () => {
    await monitorPowerStatus();
};
