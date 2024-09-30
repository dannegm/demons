import { startListener } from './handler';
import { startRunner } from './runner';

export const startDemons = () => {
    startListener();
    startRunner();
};

startDemons();
