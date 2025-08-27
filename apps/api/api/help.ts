import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateTeachingTip } from '../lib/models.js';

interface HelpRequest {
  state?: any; // Game state (simplified for now)
  context?: string; // Additional context
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://bradmarnold.github.io';
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { state, context }: HelpRequest = req.body || {};

    // Create a simplified context description
    let gameContext = 'Playing Hong Kong Mahjong';
    
    if (state) {
      const phase = state.phase || 'unknown';
      const playerCount = state.players?.length || 4;
      const wallSize = state.wall?.length || 'unknown';
      const currentPlayer = state.currentPlayer || 'unknown';
      
      gameContext = `Currently in ${phase} phase with ${playerCount} players. Wall has ${wallSize} tiles remaining. Current player: ${currentPlayer}.`;
    }

    if (context) {
      gameContext += ` Additional context: ${context}`;
    }

    // Get AI-generated teaching tip
    const tip = await generateTeachingTip(gameContext);

    res.status(200).json({
      tip,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Help API error:', error);
    
    // Return fallback tip on error
    res.status(200).json({
      tip: "Focus on completing simple sets like pungs (3 identical tiles) and chis (3 consecutive tiles). Keep your hand organized and watch what others discard!",
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}