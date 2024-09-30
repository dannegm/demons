import { exec } from 'child_process';
import { consola } from 'consola';

const IS_DEV = process.env.NODE_ENV !== 'production';

export const lockscreen = () => {
    consola.log('Pantalla bloqueada.');
    if (IS_DEV) {
        return;
    }

    exec(
        `osascript -e 'tell application "System Events" to key code 12 using {control down, command down}'`,
        error => {
            if (error) {
                consola.error(`Error al bloquear la pantalla: ${error.message}`);
            } else {
                consola.success('Pantalla bloqueada.');
            }
        },
    );
};
