import OpenAI from 'openai';
import { buildIdeaPrompt } from '../prompts/idea';
import { buildResponsePrompt } from '../prompts/response';
import { buildSummaryPrompt } from '../prompts/summary';
import { buildGameOverPrompt } from '../prompts/gameOver';
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        throw new Error('OPENAI_API_KEY manquante');
    return new OpenAI({ apiKey });
}
function getOpenAIModel() {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}
async function callOpenAI(prompt) {
    const client = getOpenAIClient();
    const model = getOpenAIModel();
    const completion = await client.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: 'Tu es une IA francophone concise et utile.' },
            { role: 'user', content: prompt },
        ],
    });
    const raw = completion.choices?.[0]?.message?.content;
    if (!raw)
        return '';
    if (typeof raw === 'string')
        return raw.trim();
    if (Array.isArray(raw)) {
        return raw
            .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
            .join('')
            .trim();
    }
    return '';
}
export async function generateDebateIdea(theme, difficulty) {
    const prompt = buildIdeaPrompt(theme, difficulty);
    return await callOpenAI(prompt);
}
export async function generateResponse(character, idea, playerPosition, playerResponse, exchangeCount) {
    const prompt = buildResponsePrompt(character, idea, playerPosition, playerResponse, exchangeCount);
    return await callOpenAI(prompt);
}
export async function generateSummary(idea, exchanges, finalScore) {
    const prompt = buildSummaryPrompt(idea, exchanges, finalScore);
    return await callOpenAI(prompt);
}
export async function generateGameOverMessage(finalScore, playerName) {
    const prompt = buildGameOverPrompt(finalScore, playerName);
    return await callOpenAI(prompt);
}
