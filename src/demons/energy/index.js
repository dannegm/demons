import { exec } from 'child_process';
import { consola } from 'consola';
import ntfy from '../../ntfy';

let lastStatus = null;

const checkPowerStatus = handler => {
    exec('pmset -g batt', (error, stdout, stderr) => {
        if (error) {
            consola.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            consola.error(`Stderr: ${stderr}`);
            return;
        }

        const isConnectedToPower = stdout.includes('AC Power');
        if (lastStatus === null) {
            lastStatus = isConnectedToPower;
        }

        if (lastStatus !== isConnectedToPower) {
            lastStatus = isConnectedToPower;
            handler(isConnectedToPower);
        }
    });
};

const onPowerChange = async isConnectedToPower => {
    if (isConnectedToPower) {
        consola.info('Power connected.');
        await ntfy.push({
            tags: 'battery,green_circle',
            title: 'Macbook Power',
            message: 'Macbook conectada a la corriente elétrica',
        });
    } else {
        consola.info('Power disconnected.');
        await ntfy.push({
            tags: 'battery,red_circle',
            title: 'Macbook Power',
            message: 'Macbook desconectada a la corriente elétrica',
        });
    }
};

export const energyRunner = async () => {
    checkPowerStatus(onPowerChange);
};
