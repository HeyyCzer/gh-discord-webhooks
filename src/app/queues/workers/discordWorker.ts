import { Job, Worker } from "bullmq";
import { redis } from "../../database/redis";
import { DiscordWebhookService } from "../../services/discordWebhook";
import logger from "../../utils/logger";
import { DiscordJobData } from "../discordQueue";

const discordWebhookWorker = new Worker("discordWebhookQueue", async (job: Job<DiscordJobData, void>) => {
	const data = job.data;
	const service = new DiscordWebhookService(data.webhookUrl);
	await service.sendMessage(data.message);
}, {
	connection: redis,
	limiter: {
		max: 5,
		duration: 1200,
	}
});

discordWebhookWorker.on("active", (job) => {
	logger.debug(`Processing job with ID ${job.id}`);
});

discordWebhookWorker.on("error", (err) => {
	logger.error(err, "Worker encountered an error:");
});

discordWebhookWorker.on("failed", (job, err) => {
	console.error(err, `Job with ID ${job?.id} has failed with error`);
});

discordWebhookWorker.on("completed", (job) => {
	logger.info(`Job with ID ${job.id} has been completed`);
});

export { discordWebhookWorker };

