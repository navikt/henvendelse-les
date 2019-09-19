import express, {Request, RequestHandler, Response} from "express";
import {Registry} from "prom-client";

function isAlive(request: Request, response: Response) {
    response.send('Application is UP');
}

function isReady(request: Request, response: Response) {
    response.send('Application is READY');
}

function metrics(registry: Registry): RequestHandler {
    return (request, response) => {
        response.set('Content-Type', registry.contentType);
        response.send(registry.metrics());
    };
}

export default function setup(registry: Registry) {
    const router = express.Router({caseSensitive: false});

    router.get("/isAlive", isAlive);
    router.get("/isReady", isReady);
    router.get("/metrics", metrics(registry));

    return router;
}