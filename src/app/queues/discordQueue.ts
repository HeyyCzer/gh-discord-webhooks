import { Queue } from "bullmq";
import { EmbedData } from "discord.js";
import { redis } from "../database/redis";
import logger from "../utils/logger";
import "./workers/discordWorker";

const discordQueue = new Queue("discordWebhookQueue", {
	connection: redis,
});

discordQueue.on("waiting", (job) => {
	logger.debug(`Job ${job.id} is waiting to be processed`);
});

discordQueue.on("progress", (job, progress) => {
	logger.debug(`Job ${job.id} is ${progress}% complete`);
});

discordQueue.on("error", (err) => {
	logger.error(err, "Queue encountered an error");
});

interface DiscordJobData {
	webhookUrl: string;
	message: EmbedData;
}

export { DiscordJobData, discordQueue };

