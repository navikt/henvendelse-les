import winston from 'winston';
import { default as morganSetup } from 'morgan';

const isDev = process.env.NODE_ENV === 'development';

const options = {
    console: {
        level: isDev ? 'debug' : 'info',
        handleExceptions: true,
        colorize: false
    }
};

const logger = winston.createLogger({
    transports: new winston.transports.Console(options.console),
    exitOnError: false
});

const loggerstream = {
    write(message: string) {
        logger.info(message);
    }
};

// Url kan ha sensitivt innhold i queryparams, så vi fjerner alle query-params
morganSetup.token('url', (req) => {
    const url = req.originalUrl || req.url;
    return url.slice(0, url.indexOf('?'));
});

export const morgan = isDev ? morganSetup('dev') : morganSetup('tiny', { stream: loggerstream });

export default logger;