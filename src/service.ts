import {MaybeCls as Maybe} from '@nutgaard/maybe-ts';
import {DBConnection, withConnection} from './db/db';
import {AktorIdFnrMapping, HenvendelseMetadata, HenvendelseMetadataDTO, Metadata, TilhorighetResultat} from "./types";
import Log from "./logging";

const henvendelseMetadataMapper = (data: HenvendelseMetadataDTO): HenvendelseMetadata => ({
    henvendelseId: data.HENVENDELSE_ID,
    behandlingsId: data.BEHANDLINGSID,
    behandlingsKjedeId: data.BEHANDLINGSKJEDEID
});

async function hentAktorid(connection: DBConnection, fnr: string): Promise<Maybe<AktorIdFnrMapping>> {
    const sql = 'select * from henvendelse.aktor_fnr_mapping where fnr = :fnr';
    const result = await connection.execute<{ AKTORID: string; FNR: string; }>(sql, [fnr]);
    return Maybe.of(result.rows)
        .filter((rows) => rows.length > 0)
        .map((rows) => rows[0])
        .map((data) => ({aktorId: data.AKTORID, fnr: data.FNR}));
}

async function hentHenvendelseMetadata(fnr: string): Promise<Metadata> {
    return withConnection(async (connection) => {
        const maybeAktorId: Maybe<AktorIdFnrMapping> = await hentAktorid(connection, fnr);
        if (maybeAktorId.isNothing()) {
            Log.warn(`Fant ikke aktørId for ${fnr}`);
        }

        return maybeAktorId
            .map(async ({aktorId}) => {
                const sql = 'select behandlingsid, henvendelse_id, behandlingskjedeid from henvendelse.henvendelse where aktor = :aktorId';
                const result = await connection.execute<HenvendelseMetadataDTO>(sql, [aktorId]);
                const henvendelser: HenvendelseMetadata[] = result.rows.map(henvendelseMetadataMapper);

                return {aktorId, henvendelser};
            })
            .getOrElse({aktorId: '', henvendelser: []});
    });
}

export async function verifiserBehandlingsIdTilhorighet(fnr: string, behandlingsIder: string[]): Promise<TilhorighetResultat> {
    const {aktorId, henvendelser} = await hentHenvendelseMetadata(fnr);
    const kjenteBehandlingsIder = henvendelser.map(({behandlingsId}) => behandlingsId);
    const alleTilhorteBruker = behandlingsIder.every((behandlingsId) => kjenteBehandlingsIder.includes(behandlingsId));
    return {alleTilhorteBruker, aktorId};
}

export async function verifiserHenvendelseIdTilhorighet(fnr: string, henvendelseIder: string[]): Promise<TilhorighetResultat> {
    const {aktorId, henvendelser} = await hentHenvendelseMetadata(fnr);
    const kjenteHenvendelseIder = henvendelser.map(({henvendelseId}) => henvendelseId);
    const alleTilhorteBruker = henvendelseIder.every((henvendelseId) => kjenteHenvendelseIder.includes(henvendelseId));
    return {alleTilhorteBruker, aktorId};
}