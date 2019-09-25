import {DB, DBConnection, DBResult} from "./db";

const henvendelse = (id: string) => ({BEHANDLINGSID: id, BEHANDLINGSKJEDEID: id + 'k', HENVENDELSE_ID: id + 'h'});
const mockData: any = {
    aktorMapping: {
        '12345678910': '00012345678910',
        '12345678911': '00012345678911'
    },
    henvendelser: {
        '00012345678910': [henvendelse('1'), henvendelse('2'), henvendelse('3'), henvendelse('4')],
        '00012345678911': [henvendelse('5'), henvendelse('6'), henvendelse('7'), henvendelse('8')]
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
        } else if (sql.startsWith('select behandlingsid, henvendelse_id, behandlingskjedeid from henvendelse.henvendelse')) {
            const aktorId = bindParams[0] as string;
            const data = mockData.henvendelser[aktorId];

            if (!data) {
                return Promise.resolve({rows: []});
            }

            return Promise.resolve({rows: data});
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