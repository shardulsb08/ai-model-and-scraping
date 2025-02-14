const express = require('express');
const router = express.Router();
const { processMessage, getConversation } = require('../controllers/chatController');

router.post('/chat', processMessage);
router.get('/conversations/:id', getConversation);

module.exports = router;
