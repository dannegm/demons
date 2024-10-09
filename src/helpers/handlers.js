export const retry = async (promiseFunc, { retries = 5, delay = 0 } = {}) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await promiseFunc();
            return [result, null];
        } catch (error) {
            if (i === retries - 1) {
                return [null, error];
            }
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};
