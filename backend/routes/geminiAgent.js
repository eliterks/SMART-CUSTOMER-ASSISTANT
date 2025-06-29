import fs from 'fs';
import path from 'path';
import axios from 'axios';

const configPath = path.resolve('./config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const userMessage = messages[messages.length - 1]?.parts[0]?.text?.toLowerCase();

  let industry = Object.keys(config).find((key) =>
    userMessage?.includes(key.replace('_', ' '))
  ) || 'default';

  const systemPrompt = config[industry]?.prompts?.intro || config.default.prompts.intro;
  const qualifiers = config[industry]?.prompts?.qualifiers || [];

  const promptText = `${systemPrompt}\n\n${qualifiers.join('\n')}\n\nChat History:\n${messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.parts[0].text}`)
    .join('\n')}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: promptText }] }],
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ response: text || 'No response received from Gemini.' });
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API request failed' });
  }
}
