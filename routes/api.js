const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON, addAdmin } = require('../lib/functions');
const { authenticateApiKey } = require('../lib/auth');
const qrcode = require('qrcode');

let botState = {
  sock: null,
  connectionStatus: 'disconnected',
  qrCode: null,
  startTime: null
};

function setBotState(state) {
  botState = { ...botState, ...state };
}

function getBotState() {
  return botState;
}

router.get('/status', authenticateApiKey, async (req, res) => {
  try {
    const state = getBotState();
    const uptime = state.startTime ? Date.now() - state.startTime : 0;
    const uptimeSeconds = Math.floor(uptime / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);
    
    let qrCodeBase64 = null;
    if (state.qrCode) {
      try {
        qrCodeBase64 = await qrcode.toDataURL(state.qrCode);
      } catch (e) {
        qrCodeBase64 = 'Error generating QR code';
      }
    }
    
    const uptimeFormatted = uptimeDays > 0 
      ? `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
      : uptimeHours > 0
      ? `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
      : uptimeMinutes > 0
      ? `${uptimeMinutes}m ${uptimeSeconds % 60}s`
      : `${uptimeSeconds}s`;
    
    const ping = Date.now();
    
    res.json({
      status: true,
      data: {
        connectionStatus: state.connectionStatus,
        qrCode: state.connectionStatus === 'disconnected' && state.qrCode ? qrCodeBase64 : (state.connectionStatus === 'connected' ? 'Connected - No QR needed' : 'Need Scan'),
        uptime: uptimeFormatted,
        uptimeMs: uptime,
        ping: ping,
        serverTime: new Date().toISOString()
      }
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error getting status: ' + e.message
    });
  }
});

router.post('/admin/add', authenticateApiKey, (req, res) => {
  try {
    const { number } = req.body;
    
    if (!number) {
      return res.status(400).json({
        status: false,
        message: 'Number is required'
      });
    }
    
    const normalizedNumber = number.replace('@', '').replace('+', '').replace('@s.whatsapp.net', '');
    const adminId = normalizedNumber + '@s.whatsapp.net';
    
    addAdmin(adminId);
    
    res.json({
      status: true,
      message: `Admin ${adminId} has been added successfully`
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error adding admin: ' + e.message
    });
  }
});

router.get('/autoreply/list', authenticateApiKey, (req, res) => {
  try {
    const autoreply = readJSON('autoreply.json');
    res.json({
      status: true,
      data: autoreply
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error getting auto-reply list: ' + e.message
    });
  }
});

router.post('/autoreply/add', authenticateApiKey, (req, res) => {
  try {
    const { keyword, response } = req.body;
    
    if (!keyword || !response) {
      return res.status(400).json({
        status: false,
        message: 'Keyword and response are required'
      });
    }
    
    const autoreply = readJSON('autoreply.json');
    autoreply[keyword.toLowerCase()] = response;
    writeJSON('autoreply.json', autoreply);
    
    res.json({
      status: true,
      message: `Auto-reply for keyword "${keyword}" has been added successfully`
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error adding auto-reply: ' + e.message
    });
  }
});

router.post('/autoreply/delete', authenticateApiKey, (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword) {
      return res.status(400).json({
        status: false,
        message: 'Keyword is required'
      });
    }
    
    const autoreply = readJSON('autoreply.json');
    if (autoreply[keyword.toLowerCase()]) {
      delete autoreply[keyword.toLowerCase()];
      writeJSON('autoreply.json', autoreply);
      
      res.json({
        status: true,
        message: `Auto-reply for keyword "${keyword}" has been deleted successfully`
      });
    } else {
      res.status(404).json({
        status: false,
        message: 'Auto-reply not found'
      });
    }
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error deleting auto-reply: ' + e.message
    });
  }
});

router.post('/send-message', authenticateApiKey, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        status: false,
        message: 'To and message are required'
      });
    }
    
    const state = getBotState();
    if (!state.sock) {
      return res.status(503).json({
        status: false,
        message: 'Bot is not connected. Please wait for connection.'
      });
    }
    
    if (state.connectionStatus !== 'connected') {
      return res.status(503).json({
        status: false,
        message: 'Bot is not connected. Current status: ' + state.connectionStatus
      });
    }
    
    const normalizedNumber = to.replace('@', '').replace('+', '').replace('@s.whatsapp.net', '');
    const targetJid = normalizedNumber + '@s.whatsapp.net';
    
    await state.sock.sendMessage(targetJid, { text: message });
    
    res.json({
      status: true,
      message: `Message sent successfully to ${targetJid}`
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error sending message: ' + e.message
    });
  }
});

router.post('/restart', authenticateApiKey, (req, res) => {
  try {
    res.json({
      status: true,
      message: 'Restart command received. Process will be terminated.'
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (e) {
    res.status(500).json({
      status: false,
      message: 'Error restarting: ' + e.message
    });
  }
});

module.exports = { router, setBotState, getBotState };

