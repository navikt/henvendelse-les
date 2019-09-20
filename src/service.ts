import {MaybeCls as Maybe} from '@nutgaard/maybe-ts';
import { withConnection, DBConnection } from './db/db';
import {AktorIdFnrMapping} from "./types";
import Log from "./logging";

async function hentAktorid(connection: DBConnection, fnr: string): Promise<Maybe<AktorIdFnrMapping>> {
    const res = await connection.execute<AktorIdFnrMapping>('select * from henvendelse.aktor_fnr_mapping where fnr = :fnr', [fnr]);
    return Maybe.of(res.rows)
        .filter((rows) => rows.length > 0)
        .map((rows) => rows[0]);
}

export interface TilhorighetResultat { alleTilhorteBruker: boolean, aktorId: string }
export async function verifiserBehandlingsIdTilhorighet(fnr: string, behandlingsIder: string[]): Promise<TilhorighetResultat> {
    return withConnection(async (connection) => {
        const aktorId = await hentAktorid(connection, fnr);
        if (aktorId.isNothing()) {
            Log.warn(`Fant ikke aktørId for ${fnr}`);
        }

        return aktorId
            .map(async ({AKTORID}) => {
                const result = await connection.execute<{ BEHANDLINGSID: string }>(`select behandlingsid from henvendelse.henvendelse where aktor = :aktorId`, [AKTORID]);
                const kjenteBehandlingsIder = result.rows.map(({ BEHANDLINGSID }) => BEHANDLINGSID);
                const alleTilhorteBruker = behandlingsIder.every((behandlingsId) => kjenteBehandlingsIder.includes(behandlingsId));
                return { alleTilhorteBruker, aktorId: AKTORID };
            })
            .getOrElse({ alleTilhorteBruker: false, aktorId: '' });
    });
}