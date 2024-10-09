import axios from 'axios';
import EventSource from 'eventsource';
import { buildCustomLogger } from '@/services/logger';

const logger = buildCustomLogger('ntfy');

const APP_TOPIC = process.env.APP_TOPIC;

class Ntfy {
    constructor(topic) {
        this.topic = topic;

        const ntfyUrl = `https://ntfy.sh/${topic}`;
        this.ntfyUrl = ntfyUrl;
        this.EventSource = new EventSource(`${ntfyUrl}/sse`);
    }

    async push({ title, message, tags }) {
        logger.debug(`Sending: ${title}`);
        try {
            const title = title || 'DNN Demons';
            await axios.post(this.ntfyUrl, message, {
                headers: {
                    Title: title,
                    Tags: tags || 'white_circle',
                    Markdown: 'yes',
                },
            });
            logger.success(`Sent: ${title} | ${message}`);
        } catch (err) {
            logger.error('Error sending notification', err);
        }
    }

    onMessage(handler) {
        this.EventSource.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            logger.info(`Received: ${data.title} | ${data.message}`);
            handler(event);
        });
    }
}

export default new Ntfy(APP_TOPIC);
