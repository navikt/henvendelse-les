import {DB, DBConnection, DBResult} from "./db";

const mockData: any = {
    aktorMapping: {
        '12345678910': '00012345678910',
        '12345678911': '00012345678911'
    },
    behandlingsIder: {
        '00012345678910': ['1', '2', '3', '4'],
        '00012345678911': ['5', '6', '7', '8']
    }
};

const mockConnection: DBConnection = {
    execute<T>(sql: string, bindParams: string[]): Promise<DBResult<T>> {
        if (sql.startsWith('select * from henvendelse.aktor_fnr_mapping')) {
            const fnr = bindParams[0] as string;
            const aktorId = mockData.aktorMapping[fnr];

            if (!aktorId) {
                return Promise.resolve({rows: []});
            }

            const rows: T[] = [{AKTORID: aktorId, FNR: fnr} as any];
            return Promise.resolve({rows});
        } else if (sql.startsWith('select behandlingsid from henvendelse.henvendelse')) {
            const aktorId = bindParams[0] as string;
            const behandlingsIder = mockData.behandlingsIder[aktorId];

            if (!behandlingsIder) {
                return Promise.resolve({rows: []});
            }

            const rows: T[] = behandlingsIder.map((id: string) => ({ BEHANDLINGSID: id }));
            return Promise.resolve({rows});
        } else {
            return Promise.reject('Unknown SQL in mock');
        }
    },
    // tslint:disable-next-line:no-empty
    close(): void {}
};

const db: DB = {
    getConnection(): Promise<DBConnection> {
        return Promise.resolve(mockConnection);
    }
};

export default db;