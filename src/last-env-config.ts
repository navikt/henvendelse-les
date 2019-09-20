import path from "path";
import dotenv from 'dotenv';
import Log from "./logging";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            HENVENDELSE_DB_USERNAME: string;
            HENVENDELSE_DB_PASSWORD: string;
            HENVENDELSE_DB_URL: string;
            ISSO_JWKS_URL: string;
            ISSO_ISSUER: string;
            USE_MOCK: string;
        }
    }
}

const requiredEnvVars = [
    'HENVENDELSE_DB_USERNAME',
    'HENVENDELSE_DB_PASSWORD',
    'HENVENDELSE_DB_URL',
    'ISSO_JWKS_URL',
    'ISSO_ISSUER'
];

function setIfMissing(key: string, value: string) {
    if (!process.env[key]) {
        process.env[key] = value;
    }
}

setIfMissing('ISSO_JWKS_URL', 'https://isso-q.adeo.no/isso/oauth2/connect/jwk_uri');
setIfMissing('ISSO_ISSUER', 'https://isso-q.adeo.no:443/isso/oauth2');

if (process.env.NODE_ENV === 'development') {
    dotenv.config({path: path.resolve(process.cwd(), 'db_user.env')});
    dotenv.config();
} else {
    dotenv.config({path: '/var/run/secrets/nais.io/vault/db_user.env'});
}

const missingEnvVars = requiredEnvVars
    .filter((property) => !process.env[property] || process.env[property].length === 0);

if (missingEnvVars.length > 0) {
    Log.error(`Missing environment variables: ${missingEnvVars.join(', ')}. Terminating process.`);
    process.exit(1);
}