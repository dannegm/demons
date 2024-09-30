import { Cron } from 'croner';
import { consola } from 'consola';
import { energyRunner } from './demons/energy/index';

const IS_DEV = process.env.NODE_ENV !== 'production';

const cronOptions = {
    paused: true,
};

const runner = async () => {
    energyRunner();
};

const cronJob = Cron('* * * * * *', cronOptions, runner);

export const startRunner = async () => {
    console.log('Starting runner...');
    cronJob.resume();
};
