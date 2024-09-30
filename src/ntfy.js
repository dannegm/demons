import axios from 'axios';
import EventSource from 'eventsource';
import { consola } from 'consola';

const APP_TOPIC = process.env.APP_TOPIC;

class Ntfy {
    constructor(topic) {
        this.topic = topic;

        const ntfyUrl = `https://ntfy.sh/${topic}`;
        this.ntfyUrl = ntfyUrl;
        this.EventSource = new EventSource(`${ntfyUrl}/sse`);
    }

    async push({ title, message, tags }) {
        consola.info('Start sending');
        try {
            await axios.post(this.ntfyUrl, message, {
                headers: {
                    Title: title || 'DNN Demons',
                    Tags: tags || 'white_circle',
                    Markdown: 'yes',
                },
            });
            consola.success('Notification sent');
        } catch (err) {
            consola.error('Error sending notification', err);
        }
    }

    onMessage(handler) {
        this.EventSource.addEventListener('message', handler);
    }
}

export default new Ntfy(APP_TOPIC);
