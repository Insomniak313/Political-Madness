import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildIdeaPrompt } from '../prompts/idea';
import { buildResponsePrompt } from '../prompts/response';
import { buildSummaryPrompt } from '../prompts/summary';
import { buildGameOverPrompt } from '../prompts/gameOver';
function getModel() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey)
        throw new Error('GOOGLE_API_KEY manquante');
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = process.env.GOOGLE_MODEL || 'gemini-2.5-flash-lite';
    return genAI.getGenerativeModel({ model: modelId });
}
export async function generateDebateIdea(theme, difficulty) {
    const model = getModel();
    const prompt = buildIdeaPrompt(theme, difficulty);
    const result = await model.generateContent(prompt);
    return result.response.text();
}
export async function generateResponse(character, idea, playerPosition, playerResponse, exchangeCount) {
    const model = getModel();
    const prompt = buildResponsePrompt(character, idea, playerPosition, playerResponse, exchangeCount);
    const result = await model.generateContent(prompt);
    return result.response.text();
}
export async function generateSummary(idea, exchanges, finalScore) {
    const model = getModel();
    const prompt = buildSummaryPrompt(idea, exchanges, finalScore);
    const result = await model.generateContent(prompt);
    return result.response.text();
}
export async function generateGameOverMessage(finalScore, playerName) {
    const model = getModel();
    const prompt = buildGameOverPrompt(finalScore, playerName);
    const result = await model.generateContent(prompt);
    return result.response.text();
}
