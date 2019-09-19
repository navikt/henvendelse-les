import dotenv from 'dotenv';
import path from 'path';
import Log from './../logging';

function prepareConnectionString(str: string) {
    return str.replace('jdbc:oracle:thin:@', '');
}

const requiredEnvVars = ['HENVENDELSE_DB_USERNAME', 'HENVENDELSE_DB_PASSWORD', 'HENVENDELSE_DB_URL'];
const envPath = process.env.NODE_ENV === 'development' ?
    path.resolve(process.cwd(), 'db_user.env') :
    '/var/run/secrets/nais.io/vault/db_user.env';

Log.info(`Starting application with env from: ${envPath}`);

dotenv.config({ path: envPath });

const missingEnvVars = requiredEnvVars
    .filter((property) => !process.env[property] || process.env[property].length === 0);

if (missingEnvVars.length > 0) {
    Log.error(`Missing environment variables: ${missingEnvVars.join(', ')}. Terminating process.`);
    process.exit(1);
}

export const user = process.env.HENVENDELSE_DB_USERNAME;
export const password = process.env.HENVENDELSE_DB_PASSWORD;
export const connectionString = prepareConnectionString(process.env.HENVENDELSE_DB_URL);