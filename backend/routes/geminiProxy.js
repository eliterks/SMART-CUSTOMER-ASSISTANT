import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { question } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not set' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: question }]
          }
        ]
      }
    );

    const output = response.data.candidates[0]?.content?.parts[0]?.text || 'No response';
    res.json({ response: output });

  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API request failed' });
  }
});

export default router;
