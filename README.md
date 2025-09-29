# GitHub Discord Webhook

This repository contains the source code of a RestAPI that receives GitHub's webhooks and sends them as Discord messages.

But... why not use [Discord's built-in GitHub Webhook integration](https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook)?

It's simple: the formatting is limited and the messages are not very pretty. Also, the message often gets truncated.

## Features

- WIP: Support multiple GitHub events
- Plug-n-play replacement for Discord's built-in GitHub Webhook integration

## Usage
1. Clone the repository
2. Install dependencies with `npm install`
3. Send a POST request to `/github/events?webhookUrl=<DISCORD_WEBHOOK_URL>` with the GitHub event payload
4. The message will be sent to the Discord webhook URL specified in the `DISCORD_WEBHOOK_URL` query parameter

## Example
You can use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to send a POST request to the API.

### Request
- URL: `http://localhost:3000/github/events?webhookUrl=<DISCORD_WEBHOOK_URL>`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `X-GitHub-Event: push` (or any other GitHub event)
- Body: Raw JSON (GitHub event payload)
```json
{
  "ref": "refs/heads/main",
  "before": "...",
  "after": "...",
  "repository": {...},
  "pusher": {...},
  "commits": [...]
}
```

### Response
- Status: `204 No Content`
- Body: Empty

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.