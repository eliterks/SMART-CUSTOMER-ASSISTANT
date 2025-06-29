import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load config for different industries
const config = JSON.parse(
  fs.readFileSync(path.join('backend', 'config.json'), 'utf8')
);

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not set' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No message history provided.' });
  }

  // Convert to Gemini API's expected format
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    parts: msg.parts,
  }));

  // Determine industry from user messages
  const userText = messages.map((m) => m.parts[0]?.text || '').join(' ').toLowerCase();
  let industry = 'default';
  if (userText.includes('real estate')) industry = 'real_estate';
  else if (userText.includes('insurance')) industry = 'insurance';

  const prompts = config[industry]?.prompts || config.default.prompts;

  // Inject prompt intro at the beginning of the chat
  formattedMessages.unshift({
    role: 'user',
    parts: [{ text: prompts.intro }],
  });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: formattedMessages,
      }
    );

    const output = response.data.candidates[0]?.content?.parts[0]?.text || 'No reply from Gemini';

    // Basic keyword-based classification
    let classification = 'Invalid';
    const text = output.toLowerCase();
    if (text.includes('budget') || text.includes('timeline')) classification = 'Hot';
    else if (text.includes('just browsing') || text.includes('not sure')) classification = 'Cold';

    res.json({ response: output, status: classification });
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API request failed' });
  }
});

export default router;
