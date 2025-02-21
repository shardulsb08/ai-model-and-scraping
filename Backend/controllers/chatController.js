const Conversation = require('../models/Conversation');
const { generateAIResponse } = require('../utils/pythonRunner');

const processMessage = async (req, res) => {
  try {
    const { message, conversationId, domain } = req.body;

    // Generate AI response
    const aiResponse = await generateAIResponse(message, domain);

    // Store in MongoDB
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      conversation.messages.push(
        { content: message, role: 'user' },
        { content: aiResponse, role: 'assistant' },
      );
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        messages: [
          { content: message, role: 'user' },
          { content: aiResponse, role: 'assistant' },
        ],
      });
    }

    res.json({
      conversationId: conversation._id,
      message: aiResponse,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(404).json({ error: 'Conversation not found' });
  }
};

module.exports = { processMessage, getConversation };
