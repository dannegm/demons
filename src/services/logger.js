import { createLogger, format, transports, addColors } from 'winston';

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        demon: 3,
        command: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        demon: 'magenta',
        command: 'cyan',
    },
};

addColors(customLevels.colors);

const logger = createLogger({
    levels: customLevels.levels,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console({
            level: 'demon',
            format: format.combine(format.colorize(), format.simple()),
        }),
        new transports.Console({
            level: 'command',
            format: format.combine(format.colorize(), format.simple()),
        }),
        new transports.File({
            filename: 'logs/demon.log',
            level: 'demon',
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
            filename: 'logs/command.log',
            level: 'command',
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
            filename: 'logs/app.log',
            level: 'info',
            format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
        }),
    ],
});

const buildCustomLogger = level => {
    return (tag, ...args) => {
        logger.log('demon', `[${tag}] ${args.map(s => s.toString()).join(' - ')}`);
    };
};

logger.demon = buildCustomLogger('demon');
logger.command = buildCustomLogger('command');

export { logger };
