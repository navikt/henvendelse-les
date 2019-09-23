import { ErrorRequestHandler, Request, RequestHandler } from 'express';
import jwt, {UnauthorizedError} from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export interface User {
    sub: string;
    aud: string;
    auth_time: number;
    realm: string;
    exp: number;
}
export type AuthenticatedRequest = Request & { user: User; systemUser: User; };

const secretResolver = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.ISSO_JWKS_URL
});

const userJwtImpl: RequestHandler = jwt({
    secret: secretResolver,
    issues: process.env.ISSO_ISSUER,
    algorithms: ['RS256']
});
const systemJwtImpl : RequestHandler = jwt({
    secret: secretResolver,
    issues: process.env.ISSO_ISSUER,
    algorithms: ['RS256'],
    requestProperty: 'systemUser',
    getToken(req: Request) {
        const systemAuthroization: string | undefined = req.headers.systemauthorization as string;
        if(systemAuthroization && systemAuthroization.split(' ')[0] === 'Bearer') {
            return systemAuthroization.split(' ')[1];
        } else {
            throw new UnauthorizedError('credentials_required', { message: 'No systemAuthorization token was found' });
        }
    }
});

const userJwtMock: RequestHandler = (req, resp, next) => {
    (req as AuthenticatedRequest).user = {
        sub: 'Z999999',
        aud: 'app',
        auth_time: 0,
        realm: '/',
        exp: 0
    };

    next()
};

const systemJwtMock: RequestHandler = (req, resp, next) => {
    (req as AuthenticatedRequest).systemUser = {
        sub: 'srvModiabrukerdialog',
        aud: 'app',
        auth_time: 0,
        realm: '/',
        exp: 0
    };

    next()
};

const verifySystemUser: RequestHandler = (req: AuthenticatedRequest, resp, next) => {
    const systemUser = req.systemUser ? req.systemUser.sub : '';
    if (systemUser === 'srvModiabrukerdialog') {
        next();
    } else {
        const message = systemUser === '' ? 'SystemUser subject was empty' : `Unrecognized systemUser: ${systemUser}`;
        throw new UnauthorizedError('invalid_token', { message })
    }
};

const jwtErrorHandler : ErrorRequestHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.message)
    }
};

const jwtMock = [userJwtMock, systemJwtMock, verifySystemUser, jwtErrorHandler];
const jwtImpl = [userJwtImpl, systemJwtImpl, verifySystemUser, jwtErrorHandler];

export default process.env.USE_MOCK === 'true' ? jwtMock : jwtImpl;

