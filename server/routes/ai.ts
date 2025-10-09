import { Router } from 'express';
import { generateDebateIdea, generateResponse, generateSummary, generateGameOverMessage } from '../services/ai';

export const aiRouter = Router();

aiRouter.post('/idea', async (req, res) => {
  try {
    const { theme, difficulty } = req.body as { theme: string; difficulty: 'facile'|'moyen'|'difficile' };
    if (!theme || !difficulty) return res.status(400).json({ error: 'theme et difficulty requis' });
    const idea = await generateDebateIdea(theme, difficulty);
    res.json({ idea });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

aiRouter.post('/respond', async (req, res) => {
  try {
    const { character, idea, playerPosition, playerResponse, exchangeCount } = req.body as {
      character: any; idea: string; playerPosition: 'pour'|'contre'; playerResponse: string; exchangeCount: number;
    };
    if (!character || !idea || !playerPosition || exchangeCount == null) return res.status(400).json({ error: 'payload invalide' });
    const text = await generateResponse(character, idea, playerPosition, playerResponse, exchangeCount);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

aiRouter.post('/summary', async (req, res) => {
  try {
    const { idea, exchanges, finalScore } = req.body as { idea: string; exchanges: any[]; finalScore: number };
    if (!idea || !Array.isArray(exchanges) || typeof finalScore !== 'number') return res.status(400).json({ error: 'payload invalide' });
    const summary = await generateSummary(idea, exchanges, finalScore);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

aiRouter.post('/game-over', async (req, res) => {
  try {
    const { finalScore, playerName } = req.body as { finalScore: number; playerName: string };
    if (typeof finalScore !== 'number' || !playerName) return res.status(400).json({ error: 'payload invalide' });
    const text = await generateGameOverMessage(finalScore, playerName);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
