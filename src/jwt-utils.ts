import {Request, RequestHandler} from 'express';
import jwt, {SecretCallbackLong, secretType} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import {MaybeCls as Maybe} from "@nutgaard/maybe-ts";
import {AuthenticatedRequest} from "./jwt";

const issoSecretResolver = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.ISSO_JWKS_URL
});

const stsSecretResolver = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.STS_JWKS_URL
});

// tslint:disable-next-line:no-console
console.log('jwks', process.env.ISSO_JWKS_URL, process.env.STS_JWKS_URL);

interface SecretCallbackLongMap {
    [issuer: string]: SecretCallbackLong
}

const jwksResolvers : SecretCallbackLongMap = {
    [process.env.ISSO_ISSUER]: issoSecretResolver,
    [process.env.STS_ISSUER]: stsSecretResolver,
};

function combine(resolvers: SecretCallbackLongMap): SecretCallbackLong {
    return (req: Request, header: any, payload: any, done: (err: any, secret?: secretType) => void) => {
        const issuer = payload.iss;
        const resolver: SecretCallbackLong | undefined = resolvers[issuer];
        if (!resolver) {
            done("Unknown issuer: " + issuer, null);
        } else {
            resolver(req, header, payload, done);
        }
    }
}

const secretResolver: SecretCallbackLong = combine(jwksResolvers);

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
            const property: 'user' | 'systemUser' = Maybe.of(options.jwtOptions)
                .flatMap((opt) => Maybe.of(opt.requestProperty))
                .getOrElse('user');
            (req as AuthenticatedRequest)[property] = {
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
            algorithms: ['RS256'],
            ...(options.jwtOptions || {})
        })
    }
}
