import { logger } from '@/services/logger';
import { getFeature } from '@/services/features';

export const buildRunner = (featureKey, handler) => {
    if (!getFeature(featureKey)) {
        return () => null;
    }

    logger.info(`[${featureKey}] runner mounted.`);
    return handler;
};

export const buildHandler = (featureKey, handler) => {
    if (!getFeature(featureKey)) {
        return () => null;
    }

    logger.info(`[${featureKey}] handler mounted.`);
    return handler;
};
