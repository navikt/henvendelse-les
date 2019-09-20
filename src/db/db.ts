import {BindParameters, ConnectionAttributes} from "oracledb";
import Log from "../logging";

const user = process.env.HENVENDELSE_DB_USERNAME;
const password = process.env.HENVENDELSE_DB_PASSWORD;
const connectionString = process.env.HENVENDELSE_DB_URL.replace('jdbc:oracle:thin:@', '');

export interface DB {
    getConnection(connectionAttributes: ConnectionAttributes): Promise<DBConnection>;
}
export interface DBConnection {
    execute<T>(sql: string, bindParams: BindParameters): Promise<DBResult<T>>;
    close(): void
}

export interface DBResult<T> {
    rows?: T[];
}

let dbImpl : DB;
if (process.env.USE_MOCK === 'true') {
    Log.info("Starting application with mock-db");
    // tslint:disable-next-line:no-var-requires
    dbImpl = require('./mockdb.ts').default;
} else {
    Log.info("Starting application with real-db");
    // tslint:disable-next-line:no-var-requires
    dbImpl = require('oracledb');
    (dbImpl as any).outFormat = (dbImpl as any).OUT_FORMAT_OBJECT;
}

export async function withConnection<T>(lambda: (connection: DBConnection) => T): Promise<T> {
    let connection: DBConnection;
    try {
        connection = await dbImpl.getConnection({user, password, connectionString});
        return await lambda(connection);
    } catch (e) {
        Log.error('SQLConnectionFeil', e);
    } finally {
        if (connection) {
            try {
                connection.close();
            } catch (e) {
                Log.error('SQLCloseFeil', e);
            }
        }
    }
}