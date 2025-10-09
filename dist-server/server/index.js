import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { aiRouter } from './routes/ai';
const app = express();
const PORT = Number(process.env.PORT) || 8787;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/status', (_req, res) => {
    res.json({ ok: true, model: process.env.GOOGLE_MODEL || 'gemini-2.5-flash-lite' });
});
app.use('/api', aiRouter);
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
});
export { app };
