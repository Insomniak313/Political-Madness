import OpenAI from 'openai';
import { buildIdeaPrompt } from '../prompts/idea';
import { buildResponsePrompt, type AICharacterPrompt, type PositionPrompt } from '../prompts/response';
import { buildSummaryPrompt } from '../prompts/summary';
import { buildGameOverPrompt } from '../prompts/gameOver';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY manquante');
  return new OpenAI({ apiKey });
}

function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function callOpenAI(prompt: string): Promise<string> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Tu es une IA francophone concise et utile.' },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content as unknown;
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw)) {
    return (raw as Array<string | { text?: string }>)
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('')
      .trim();
  }
  return '';
}

export async function generateDebateIdea(theme: string, difficulty: 'facile'|'moyen'|'difficile'): Promise<string> {
  const prompt = buildIdeaPrompt(theme, difficulty);
  return await callOpenAI(prompt);
}

export async function generateResponse(
  character: AICharacterPrompt,
  idea: string,
  playerPosition: PositionPrompt,
  playerResponse: string,
  exchangeCount: number,
): Promise<string> {
  const prompt = buildResponsePrompt(character, idea, playerPosition, playerResponse, exchangeCount);
  return await callOpenAI(prompt);
}

export async function generateSummary(idea: string, exchanges: any[], finalScore: number): Promise<string> {
  const prompt = buildSummaryPrompt(idea, exchanges, finalScore);
  return await callOpenAI(prompt);
}

export async function generateGameOverMessage(finalScore: number, playerName: string): Promise<string> {
  const prompt = buildGameOverPrompt(finalScore, playerName);
  return await callOpenAI(prompt);
}
