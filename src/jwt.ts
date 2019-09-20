import { ErrorRequestHandler, Request, RequestHandler } from 'express';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export interface User {
    sub: string;
    aud: string;
    auth_time: number;
    realm: string;
    exp: number;
}
export type AuthenticatedRequest = Request & { user: User };

const jwtImpl: RequestHandler = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.ISSO_JWKS_URL
    }),
    issues: process.env.ISSO_ISSUER,
    algorithms: ['RS256']
});

const jwtMock: RequestHandler = (req, resp, next) => {
    (req as AuthenticatedRequest).user = {
        sub: 'Z999999',
        aud: 'app',
        auth_time: 0,
        realm: '/',
        exp: 0
    };

    next()
};

export default process.env.USE_MOCK === 'true' ? jwtMock : jwtImpl;

export const jwtErrorHandler : ErrorRequestHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.message)
    }
};