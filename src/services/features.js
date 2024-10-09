import { merge } from 'lodash';

import { features as defaultFeatures } from '@/flags';
import { features as localFeatures } from '@/flags.local';

const Envs = {
    DEFAULT: 'default',
    LOCAL: 'local',
};

const FEATURES_ENV = process.env.FEATURES_ENV || Envs.DEFAULT;

const buildFeaturesList = () => {
    if (FEATURES_ENV === Envs.DEFAULT) {
        return defaultFeatures;
    }

    const features = {
        [Envs.LOCAL]: localFeatures,
    };

    const featuresList = features[FEATURES_ENV] || {};
    return merge(defaultFeatures, featuresList);
};

export const getFeature = feature => {
    const featuresList = buildFeaturesList();
    return featuresList[feature] || false;
};
