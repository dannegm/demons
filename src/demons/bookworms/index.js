import fs from 'fs';
import path from 'path';

import { buildCustomLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import { buildHandler } from '@/helpers/builders';

const logger = buildCustomLogger('bookworms');

const basePath = '/Volumes/DNN1TB/Biblioteca/Biblioteca Secreta/biblioteca/';
const bucketName = 'bookworms';

export const requestBook = buildHandler('command.bookworms', async filename => {
    logger.info('Requesting book');

    const file = path.join(basePath, filename);
    const fileBuffer = fs.readFileSync(file);

    const { error } = await supabase.storage.from(bucketName).upload(filename, fileBuffer);

    if (error) {
        logger.error('Error uploading file');
        return;
    }

    logger.success('File uploaded successfully');
});
