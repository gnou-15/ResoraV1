import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📊 [OBSERVABILITY] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Latency: ${duration}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'Resora Node.js Backend', version: '2.5.5' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Resora Node.js Server running on port ${PORT}`);
  });
}

export default app;
