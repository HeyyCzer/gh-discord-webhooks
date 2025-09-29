import Elysia, { status } from "elysia";
import z from "zod";
import { isEventSupported, processWebhookEvent } from "../../../app/services/githubEvent";

export const githubEventsRoute = new Elysia({ prefix: "/github/events" })
	.post(
		"/",
		async (ctx) => {
			const event = ctx.headers["x-github-event"];
			if (!isEventSupported(event)) {
				return status(400, {
					message: "Event not supported",
				});
			}

			await processWebhookEvent(event, ctx.query.webhookUrl, ctx.body);
			return status(204);
		},
		{
			body: z.any(),
			headers: z.object({
				"x-github-event": z.string(),
			}),
			query: z.object({
				webhookUrl: z.string(),
			}),
			response: {
				204: z.undefined(),
				400: z.object({
					message: z.string(),
					errors: z.optional(z.array(z.object())),
				}),
			},
			description: "Handle GitHub webhook events",
			summary: "GitHub Events",
			tags: ["GitHub"]
		}
	);