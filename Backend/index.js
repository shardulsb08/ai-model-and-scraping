// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-chat')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Chat Message Schema
const messageSchema = new mongoose.Schema({
  content: String,
  role: String, // 'user' or 'assistant'
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Helper function to run Python script
const generateAIResponse = async (prompt) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['chatbot.py', prompt]);
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }
      // Extract answer from the Python script output
      const answer = result.split('Answer: ')[1]?.trim();
      resolve(answer || 'Sorry, I could not generate a response.');
    });
  });
};

// API Endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    // Generate AI response
    const aiResponse = await generateAIResponse(message);

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
});

// Get conversation history
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    res.json(conversation);
  } catch (error) {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
