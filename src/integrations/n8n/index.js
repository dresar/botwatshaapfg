const axios = require('axios');
const config = require('../../../config');

async function triggerN8nWebhook(eventName, message, userId, metadata = {}) {
  if (!config.n8nWebhookUrl) {
    throw new Error('N8N webhook URL tidak dikonfigurasi');
  }
  
  const payload = {
    event: eventName,
    message: message,
    userId: userId,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  try {
    const response = await axios.post(config.n8nWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  triggerN8nWebhook
};

