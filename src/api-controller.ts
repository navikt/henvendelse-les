import express, {Request, Response} from "express";
import bodyParser from 'body-parser';
import cors, {CorsOptions} from 'cors';
import {verifiserBehandlingsIder} from "./service";
import {asArray} from "./utils";

const corsOptions: CorsOptions = {
    origin: [/\.adeo.no$/],
    methods: 'GET',
    credentials: true,
    optionsSuccessStatus: 200, // IE11 choke on 204
    preflightContinue: false
};

function gyldigFnr(fnr: string): boolean {
    return fnr && typeof fnr === 'string' && fnr.match(/^\d{11}$/) !== null;
}

function gyldigBehandlingsid(ids: string | string[]): boolean {
    return asArray(ids)
        .filter((id) => id.length > 0)
        .length > 0
}

async function hentBehandlingsIderForFnr(request: Request, response: Response) {
    const {fnr, id} = request.query;
    if (!gyldigFnr(fnr)) {
        response.status(400);
        response.send("Ugyldig fødselsnummer");
    } else if (!gyldigBehandlingsid(id)) {
        response.status(400);
        response.send("Ugyldig id: " + id);
    } else {
        const result = await verifiserBehandlingsIder(fnr, asArray(id));

        response.set('Content-Type', 'application/json');
        response.send(JSON.stringify(result));
    }
}

export default function setup() {
    const router = express.Router({caseSensitive: false});
    router.use(bodyParser.json());
    router.use(cors(corsOptions));
    router.options('*', cors(corsOptions));

    router.get("/behandlingsider", hentBehandlingsIderForFnr);

    return router;
}