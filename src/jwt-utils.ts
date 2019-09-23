import {RequestHandler} from 'express';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import {AuthenticatedRequest} from "./jwt";

const secretResolver = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.ISSO_JWKS_URL
});

export interface SubjectResolver {
    mock: RequestHandler;
    real: RequestHandler;
}

export interface SubjectResolverOptions {
    mockSubject: string;
    jwtOptions?: Omit<jwt.Options, 'secret'>;
}

export function createSubjectResolver(options: SubjectResolverOptions): SubjectResolver {
    return {
        mock: (req, resp, next) => {
            (req as AuthenticatedRequest).user = {
                sub: options.mockSubject,
                aud: 'app',
                auth_time: 0,
                realm: '/',
                exp: 0
            };

            next()
        },
        real: jwt({
            secret: secretResolver,
            issues: process.env.ISSO_ISSUER,
            algorithms: ['RS256'],
            ...(options.jwtOptions || {})
        })
    }
}