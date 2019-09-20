import winston from 'winston';
import { Request, Response } from 'express';
import { default as morganSetup } from 'morgan';
import {AuthenticatedRequest} from "./jwt";

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

morganSetup.format('tiny', ':date[iso] :method :url :status - [:subject, :res[aktorid]] - :response-time ms');
// Url kan ha sensitivt innhold i queryparams, så vi fjerner alle query-params
morganSetup.token('url', (req) => {
    const url = req.originalUrl || req.url;
    const queryParamStart = url.indexOf('?');
    if (queryParamStart < 0) {
        return url;
    }
    return url.slice(0, queryParamStart);
});

morganSetup.token('subject', (req) => {
    if (!req.hasOwnProperty('user')) {
        return ''
    }
    const authReq : AuthenticatedRequest = req as AuthenticatedRequest;
    return authReq.user.sub;
});

const skip = (req: Request) => {
    const url = req.originalUrl || req.url;
    const isInternal = url.startsWith('/henvendelse-les/internal/');
    const isOk = req.statusCode >= 200 && req.statusCode < 300;
    return isInternal && isOk;
};

export const morgan = isDev ? morganSetup('tiny', { skip }) : morganSetup('tiny', { skip, stream: loggerstream });

export default logger;