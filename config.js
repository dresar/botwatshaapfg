require('dotenv').config();

module.exports = {
  owner: process.env.OWNER || "6281234567890",
  botName: process.env.BOT_NAME || "BotExpress",
  prefix: process.env.PREFIX || "!",
  port: process.env.PORT || 3000,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  apiKey: process.env.API_KEY || "your-secret-api-key-here"
};

