export interface AktorIdFnrMapping {
    fnr: string;
    aktorId: string;
}

export interface TilhorighetResultat {
    alleTilhorteBruker: boolean;
    aktorId: string;
}

export interface HenvendelseMetadata {
    henvendelseId: string;
    behandlingsId: string;
    behandlingsKjedeId: string;
}

export interface HenvendelseMetadataDTO {
    HENVENDELSE_ID: string;
    BEHANDLINGSID: string;
    BEHANDLINGSKJEDEID: string;
}
export interface Metadata {
    aktorId: string;
    henvendelser: HenvendelseMetadata[];
}