import { EmbedBuilder, EmbedData, WebhookClient } from "discord.js";
import logger from "../utils/logger";

export class DiscordWebhookService {

	private client: WebhookClient;

	constructor(webhookUrl: string) {
		this.client = new WebhookClient({ url: webhookUrl });
	}

	public async sendMessage(messagePayload: EmbedData) {
		try {
			await this.client.send({
				embeds: [new EmbedBuilder(messagePayload)],
			});
		} catch (error) {
			logger.error(error, "Error sending message to Discord webhook:", messagePayload);
			throw error;
		}
	}

}