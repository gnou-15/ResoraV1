import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'Resora Node.js Backend', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Resora Node.js Server running on port ${PORT}`);
});
