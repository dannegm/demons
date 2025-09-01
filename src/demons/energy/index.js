import { exec } from 'child_process';
import EventEmitter from 'events';
import ntfy from '@/services/ntfy';
import { buildCustomLogger } from '@/services/logger';
import { buildRunner } from '@/helpers/builders';
import { flags } from '@/services/flags';

const ENV_NAME = process.env.ENV_NAME;
const logger = buildCustomLogger('energy');

export const powerStatusEmitter = new EventEmitter();

const checkPowerStatus = () => {
    return new Promise((resolve, reject) => {
        exec('pmset -g batt', (error, stdout, stderr) => {
            if (error) {
                logger.error(error.message);
                return reject(false);
            }
            if (stderr) {
                logger.error(`Stderr: ${stderr}`);
                return reject(false);
            }

            const isConnectedToPower = stdout.includes('AC Power');
            resolve(isConnectedToPower);
        });
    });
};

const monitorPowerStatus = async () => {
    const previousStatus = await flags.getFlag('state.energy');
    const currentStatus = await checkPowerStatus();

    if (currentStatus !== previousStatus) {
        await flags.setFlag('state.energy', currentStatus);
        powerStatusEmitter.emit('status:change', { status: currentStatus });
    }
};

powerStatusEmitter.on('status:change', async ({ status }) => {
    if (status) {
        logger.info('Power connected.');
        await ntfy.push({
            tags: 'battery,green_circle',
            title: `${ENV_NAME} Power`,
            message: 'Macbook conectada a la corriente elétrica',
        });
    } else {
        logger.info('Power disconnected.');
        await ntfy.push({
            tags: 'battery,red_circle',
            title: `${ENV_NAME} Power`,
            message: 'Macbook desconectada a la corriente elétrica',
        });
    }
});

export const energyRunner = buildRunner('demon.energy', async () => {
    await monitorPowerStatus();
});
