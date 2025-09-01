const httpClient = ({ baseURL, ...config } = {}) => {
    return (url, options = {}) => {
        return fetch(baseURL + url, {
            ...config,
            ...options,
        });
    };
};

const createClient = ({ apiKey, environmentId, baseURL = 'https://endpoints.hckr.mx/flags' }) => {
    const client = httpClient({
        baseURL,
        headers: {
            'x-dnn-apikey': apiKey,
            'Content-Type': 'application/json',
        },
    });

    return {
        async getFlag(key) {
            try {
                const res = await client(`/environment/${environmentId}`);
                if (!res.ok) return false;
                const flags = (await res.json()) || {};
                return flags[key] || false;
            } catch (err) {
                return false;
            }
        },

        async setFlag(key, value) {
            try {
                const res = await client(`/flags`, {
                    method: 'POST',
                    body: JSON.stringify({
                        environment_id: environmentId,
                        key,
                        value,
                    }),
                });

                if (!res.ok) return null;
                return res.data;
            } catch (err) {
                return null;
            }
        },
    };
};

export const flags = createClient({
    apiKey: process.env.FLAGS_API_KEY,
    environmentId: process.env.FLAGS_ENVIRONMENT_ID,
});
