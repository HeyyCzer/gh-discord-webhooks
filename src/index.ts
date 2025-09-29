import "./app/services/githubEvent";

import { Elysia } from "elysia";
import logger from "./app/utils/logger";
import { githubEventsRoute } from "./http/routes/github/events";

const PORT = process.env.PORT ?? 8080;

const app = new Elysia()
	.use(githubEventsRoute)
	.listen(PORT);

logger.info(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
