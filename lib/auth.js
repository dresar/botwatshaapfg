const { isValidApiKey } = require('./functions');

function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(403).json({
      status: false,
      message: 'API key is required. Please provide x-api-key header.'
    });
  }
  
  if (!isValidApiKey(apiKey)) {
    return res.status(403).json({
      status: false,
      message: 'Invalid API key. Access denied.'
    });
  }
  
  next();
}

module.exports = { authenticateApiKey };

