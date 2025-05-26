import { Cron } from 'croner';
import { logger } from '@/services/logger';
import { energyRunner } from '@/demons/energy';
import { internetRunner } from '@/demons/internet';
import { bookwormsRunner } from './demons/bookworms/index';

const cronOptions = {
    paused: true,
};

const runner = async () => {
    energyRunner();
    internetRunner();
    bookwormsRunner();
};

const cronJob = Cron('*/5 * * * * *', cronOptions, runner);

export const startRunner = async () => {
    logger.info('Starting runner...');
    cronJob.resume();
};
