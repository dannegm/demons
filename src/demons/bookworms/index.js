import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import EventEmitter from 'events';
import axios from 'axios';

import { buildCustomLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import { buildHandler, buildRunner } from '@/helpers/builders';

const run = promisify(exec);
const logger = buildCustomLogger('bookworms');

const basePath = '/Volumes/DNN1TB/Biblioteca/Biblioteca Secreta/biblioteca/';
const bucketName = 'bookworms';

export const bucketStatusEmitter = new EventEmitter();

const getShortFilename = fullPath => {
    const parts = fullPath.split(path.sep);
    return `${parts.at(-2)}/${parts.at(-1)}`;
};

export const getConvertedFile = async (filePath, format) => {
    if (format === 'epub') {
        return {
            data: { path: filePath, filename: getShortFilename(filePath) },
        };
    }

    if (format !== 'mobi') {
        return {
            error: `Unsupported format: ${format}`,
            data: { path: filePath, filename: getShortFilename(filePath) },
        };
    }

    const mobiPath = filePath.replace(/\.epub$/i, '.mobi');
    if (fs.existsSync(mobiPath)) {
        return {
            data: { path: mobiPath, filename: getShortFilename(mobiPath) },
        };
    }

    try {
        await run(`${EBOOK_CONVERT_BIN} "${filePath}" "${mobiPath}"`);
        if (!fs.existsSync(mobiPath)) {
            return {
                error: 'Conversion failed: output file not found',
                data: { path: filePath, filename: getShortFilename(filePath) },
            };
        }

        return {
            data: { path: mobiPath, filename: getShortFilename(mobiPath) },
        };
    } catch (err) {
        return {
            error: err.message,
            data: { path: filePath, filename: getShortFilename(filePath) },
        };
    }
};

export const requestBook = buildHandler('command.bookworms', async (filename, format) => {
    logger.info('Requesting book');

    const file = path.join(basePath, filename);
    const { data: convertedFile, error: convertError } = await getConvertedFile(file, format);

    if (convertError) {
        logger.error(`Error converting file: ${convertError}`);
        return;
    }

    const fileBuffer = fs.readFileSync(convertedFile.path);

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(convertedFile.filename, fileBuffer);

    if (error) {
        logger.error('Error uploading file');
        logger.error(error.message);
        return;
    }

    logger.success('File uploaded successfully');
});

let previousStatus = null;

const checkLocalBucket = () => {
    return new Promise(resolve => {
        if (!fs.existsSync(basePath)) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
};

const monitorBucketStatus = async () => {
    const currentStatus = await checkLocalBucket();

    if (currentStatus !== previousStatus) {
        previousStatus = currentStatus;
        bucketStatusEmitter.emit('status:change', { status: currentStatus });
    }
};

const bookwormsApi = axios.create({
    baseURL: 'https://endpoints.hckr.mx/bookworms',
    headers: {
        'x-dnn-apikey': '6hcfpDiklavXpjvOo8JXeaXV9qTZiWDt',
    },
});

bucketStatusEmitter.on('status:change', async ({ status }) => {
    logger.info(`Bucket status changed: ${status ? 'Online' : 'Offline'}`);
    await bookwormsApi.put('/settings', {
        'bucket.online': status,
    });
});

export const bookwormsRunner = buildRunner(`demon.${bucketName}`, async () => {
    await monitorBucketStatus();
});
