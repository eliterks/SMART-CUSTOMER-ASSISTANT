import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiAgent from './routes/geminiAgent.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/gemini', geminiAgent);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
