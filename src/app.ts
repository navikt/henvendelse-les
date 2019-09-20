import './last-env-config';
import express, {Request, Response} from 'express';
import prometheus from 'prom-client';
import internalController from './internal-controller';
import apiController from './api-controller';
import Log, { morgan } from './logging';

prometheus.collectDefaultMetrics();

const app = express();
const PORT = 8991;
const baseRouter = express.Router({ caseSensitive: false });

app.disable('etag');
app.use(morgan);

app.use("/henvendelse-les", baseRouter);
baseRouter.use("/api", apiController());
baseRouter.use("/internal", internalController(prometheus.register));
app.get("*", (request: Request, response: Response) => {
	response.send("henvendelse-les");
});

app.listen(PORT, () => {
	Log.info(`Application started on ${PORT}`)
});