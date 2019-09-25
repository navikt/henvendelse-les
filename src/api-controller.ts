import express, {Request, Response, NextFunction, RequestHandler} from "express";
import bodyParser from 'body-parser';
import cors, {CorsOptions} from 'cors';
import * as service from "./service";
import {asArray} from "./utils";
import jwt from "./jwt";

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

function gyldigIder(ids: string | string[]): boolean {
    return asArray(ids)
        .filter((id) => id.length > 0)
        .length > 0
}

function hvisGyldigInput(fn: RequestHandler): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
        const {fnr, id} = request.query;
        if (!gyldigFnr(fnr)) {
            response.status(400);
            response.send("Ugyldig fødselsnummer");
        } else if (!gyldigIder(id)) {
            response.status(400);
            response.send("Ugyldig id: " + id);
        } else {
            return fn(request, response, next);
        }
    }
}

async function verifiserBehandlingsIdTilhorighet(request: Request, response: Response) {
    const {fnr, id} = request.query;
    const result = await service.verifiserBehandlingsIdTilhorighet(fnr, asArray(id));

    response.set('Content-Type', 'application/json');
    response.set('AktorId', result.aktorId);
    response.send(JSON.stringify(result.alleTilhorteBruker));
}

async function verifiserHenvendelseIdTilhorighet(request: Request, response: Response) {
    const {fnr, id} = request.query;
    const result = await service.verifiserHenvendelseIdTilhorighet(fnr, asArray(id));

    response.set('Content-Type', 'application/json');
    response.set('AktorId', result.aktorId);
    response.send(JSON.stringify(result.alleTilhorteBruker));
}

export default function setup() {
    const router = express.Router({caseSensitive: false});
    router.use(bodyParser.json());
    router.use(cors(corsOptions));
    router.use(jwt);
    router.options('*', cors(corsOptions));

    router.get("/behandlingsider", hvisGyldigInput(verifiserBehandlingsIdTilhorighet));
    router.get("/henvendelseider", hvisGyldigInput(verifiserHenvendelseIdTilhorighet));

    return router;
}