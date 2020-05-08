import {ErrorRequestHandler, Request, RequestHandler} from 'express';
import {UnauthorizedError} from 'express-jwt';
import {createSubjectResolver} from "./jwt-utils";
import logger from "./logging";

export interface User {
    sub: string;
    aud: string;
    auth_time: number;
    realm: string;
    exp: number;
}

export type AuthenticatedRequest = Request & { user: User; systemUser: User; };

const userJwt = createSubjectResolver({mockSubject: 'Z999999'});
const systemJwt = createSubjectResolver({
    mockSubject: 'srvModiabrukerdialog',
    jwtOptions: {
        requestProperty: 'systemUser',
        getToken(req: Request) {
            const systemAuthroization: string | undefined = req.headers.systemauthorization as string;
            if (systemAuthroization && systemAuthroization.split(' ')[0] === 'Bearer') {
                return systemAuthroization.split(' ')[1];
            } else {
                throw new UnauthorizedError('credentials_required', {message: 'No systemAuthorization token was found'});
            }
        }
    }
});

const verifySystemUser: RequestHandler = (req: AuthenticatedRequest, resp, next) => {
    const systemUser = req.systemUser ? req.systemUser.sub : '';
    if (systemUser === 'srvModiabrukerdialog') {
        next();
    } else {
        const message = systemUser === '' ? 'SystemUser subject was empty' : `Unrecognized systemUser: ${systemUser}`;
        throw new UnauthorizedError('invalid_token', {message})
    }
};

const jwtErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        logger.warn("UnauthorizedError: " + err.message);
        res.status(401).send(err.message)
    }
};

const jwtMock = [userJwt.mock, systemJwt.mock, verifySystemUser, jwtErrorHandler];
const jwtImpl = [userJwt.real, systemJwt.real, verifySystemUser, jwtErrorHandler];

export default process.env.USE_MOCK === 'true' ? jwtMock : jwtImpl;

