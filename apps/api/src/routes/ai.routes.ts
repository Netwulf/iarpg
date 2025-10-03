import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@iarpg/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
router.use(authMiddleware);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/tables/:tableId/ai/assist - Generate AI assistance for DM
router.post('/:tableId/assist', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId } = req.params;
    const userId = req.user!.id;
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new AppError('Prompt is required', 400, 'VALIDATION_ERROR');
    }

    // Fetch table and verify user is DM
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        members: {
          include: {
            character: {
              select: {
                name: true,
                race: true,
                class: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      throw new AppError('Table not found', 404, 'NOT_FOUND');
    }

    if (table.ownerId !== userId) {
      throw new AppError('Only DM can use AI assistant', 403, 'FORBIDDEN');
    }

    // Check rate limit for free tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    if (user?.tier === 'free') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentUsage = await prisma.aIUsage.count({
        where: {
          userId,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentUsage >= 10) {
        throw new AppError(
          'Rate limit exceeded. Upgrade to premium for unlimited requests.',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }
    }

    // Fetch recent messages
    const messages = await prisma.message.findMany({
      where: { tableId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Fetch active combat
    const combat = await prisma.combatEncounter.findFirst({
      where: { tableId, state: 'active' },
    });

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt({
      table: {
        name: table.name,
        description: table.description,
        tags: table.tags,
      },
      characters: table.members
        .map((m) => m.character)
        .filter((c): c is NonNullable<typeof c> => c !== null),
      recentMessages: messages
        .reverse()
        .map((m) => ({
          username: m.user.username,
          content: m.content,
        })),
      combat: combat
        ? {
            round: combat.round,
            combatants: (combat.combatants as any[]).map((c: any) => c.name),
          }
        : undefined,
    });

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullResponse = '';
    let tokensUsed = 0;

    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt.trim(),
          },
        ],
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const text = chunk.delta.text;
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();

      // Estimate tokens (rough approximation)
      tokensUsed = Math.ceil((fullResponse.length + prompt.length + systemPrompt.length) / 4);

      // Calculate cost
      const cost = calculateCost(tokensUsed);

      // Track usage
      await prisma.aIUsage.create({
        data: {
          userId,
          tableId,
          prompt: prompt.trim(),
          response: fullResponse,
          tokensUsed,
          cost,
        },
      });
    } catch (error: any) {
      console.error('AI request failed:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI request failed' })}\n\n`);
      res.end();
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/remaining - Get remaining AI requests for user
router.get('/remaining', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    if (user?.tier === 'premium' || user?.tier === 'master') {
      return res.json({ remaining: 'unlimited', limit: 'unlimited' });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsage = await prisma.aIUsage.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    res.json({ remaining: Math.max(0, 10 - recentUsage), limit: 10 });
  } catch (error) {
    next(error);
  }
});

function buildSystemPrompt(context: {
  table: { name: string; description: string; tags: string[] };
  characters: Array<{ name: string; race: string; class: string; level: number }>;
  recentMessages: Array<{ username: string; content: string }>;
  combat?: { round: number; combatants: string[] };
}): string {
  return `You are an expert Dungeon Master assistant for D&D 5e. You help DMs run engaging, creative sessions.

**Current Game Context:**

Table: ${context.table.name}
Description: ${context.table.description}
Tags: ${context.table.tags.join(', ')}

**Party:**
${context.characters.map((c) => `- ${c.name}: Level ${c.level} ${c.race} ${c.class}`).join('\n')}

${
  context.combat
    ? `**Combat Status:**
Round: ${context.combat.round}
Active combatants: ${context.combat.combatants.join(', ')}`
    : ''
}

**Recent Conversation:**
${context.recentMessages.map((m) => `${m.username}: ${m.content}`).join('\n')}

**Instructions:**
- Provide helpful, creative suggestions aligned with D&D 5e rules
- Keep responses concise (2-3 paragraphs max)
- Match the tone and setting of the current campaign
- Suggest specific actions, encounters, or story beats
- Be enthusiastic but practical

Respond to the DM's request below:`;
}

function calculateCost(tokens: number): number {
  // Claude 3.5 Sonnet pricing (as of 2024)
  const INPUT_COST_PER_1M = 3.0; // $3 per 1M input tokens
  const OUTPUT_COST_PER_1M = 15.0; // $15 per 1M output tokens

  // Estimate: 60% input, 40% output
  const inputTokens = tokens * 0.6;
  const outputTokens = tokens * 0.4;

  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M;

  return inputCost + outputCost;
}

export default router;
