import { MessagePayload } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import z from "zod";
import { DiscordJobData, discordQueue } from "../queues/discordQueue";
import { TemplateService } from "./template";

const templateService = new TemplateService();
templateService.loadPartials();

const registeredEvents: {
	[event: string]: {
		validation: z.ZodType<any>;
	}
} = {};

export function isEventSupported(event: string): boolean {
	return event in registeredEvents;
}

const TEMPLATE_BASE_PATH = path.join(import.meta.dir, "../../../templates/github-events");
export function registerWebhookEvent(event: string, format: z.ZodType<any>) {
	if (isEventSupported(event)) {
		throw new Error(`Event ${event} is already registered`);
	}

	const templatePath = path.join(TEMPLATE_BASE_PATH, `${event}.hbs`);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template for event ${event} does not exist at path ${templatePath}`);
	}

	registeredEvents[event] = {
		validation: format
	};
}

export async function processWebhookEvent(event: string, webhookUrl: string, payload: any) {
	if (!isEventSupported(event)) {
		throw new Error(`Event ${event} is not supported`);
	}

	const { validation } = registeredEvents[event];
	
	validation.parse(payload);
	const templateContent = templateService.render(event, payload);

	await discordQueue.add("githubWebhookEvent", {
		event,
		webhookUrl,
		message: templateContent as MessagePayload,
	} as DiscordJobData);
}


registerWebhookEvent(
	"push",
	z.object({
		ref: z.string(),
		pusher: z.object({
			name: z.string(),
		}),
		repository: z.object({
			name: z.string(),
			full_name: z.string(),
			html_url: z.string(),
		}),
		commits: z.array(z.object({
			id: z.string(),
			message: z.string(),
			url: z.string(),
			author: z.object({
				name: z.string(),
				email: z.string(),
			})
		}))
	})
);
