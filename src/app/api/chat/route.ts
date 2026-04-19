import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Craft from '@/lib/models/Craft';
import { calculateSimilarity, generateEmbedding } from '@/lib/nlp';
import { ensureCraftDataSeeded } from '@/lib/seed';

type ChatTurn = {
  role: 'assistant' | 'user';
  text: string;
};

type GIPreference = 'any' | 'gi' | 'non-gi';

type ChatRequestBody = {
  message?: string;
  selectedState?: string;
  language?: string;
  history?: ChatTurn[];
  contextFilters?: AppliedFilters;
  conversationId?: string;
};

type CraftDoc = {
  id: number;
  name: string;
  state: string;
  category: string;
  material: string;
  technique: string;
  summary: string;
  history: string;
  gi: boolean;
  embedding: number[];
};

type AppliedFilters = {
  states: string[];
  categories: string[];
  materials: string[];
  techniques: string[];
  giPreference: GIPreference;
};

type ChatSessionContext = {
  lastFilters: AppliedFilters;
  lastShownCraftIds: number[];
  lastUserMessages: string[];
  updatedAt: number;
};

const DEFAULT_FILTERS: AppliedFilters = {
  states: [],
  categories: [],
  materials: [],
  techniques: [],
  giPreference: 'any',
};

const SESSION_TTL_MS = 1000 * 60 * 60;

const globalSessionStore = globalThis as typeof globalThis & {
  __chatSessions?: Map<string, ChatSessionContext>;
};

function getSessionStore(): Map<string, ChatSessionContext> {
  if (!globalSessionStore.__chatSessions) {
    globalSessionStore.__chatSessions = new Map<string, ChatSessionContext>();
  }
  return globalSessionStore.__chatSessions;
}

function cleanupExpiredSessions(store: Map<string, ChatSessionContext>) {
  const now = Date.now();
  for (const [sessionId, context] of store.entries()) {
    if (now - context.updatedAt > SESSION_TTL_MS) {
      store.delete(sessionId);
    }
  }
}

function getSessionContext(conversationId: string): ChatSessionContext {
  const store = getSessionStore();
  cleanupExpiredSessions(store);

  const existing = store.get(conversationId);
  if (existing) return existing;

  const created: ChatSessionContext = {
    lastFilters: { ...DEFAULT_FILTERS },
    lastShownCraftIds: [],
    lastUserMessages: [],
    updatedAt: Date.now(),
  };
  store.set(conversationId, created);
  return created;
}

function saveSessionContext(conversationId: string, context: ChatSessionContext) {
  const store = getSessionStore();
  store.set(conversationId, { ...context, updatedAt: Date.now() });
}

function cloneFilters(filters: AppliedFilters): AppliedFilters {
  return {
    states: [...filters.states],
    categories: [...filters.categories],
    materials: [...filters.materials],
    techniques: [...filters.techniques],
    giPreference: filters.giPreference,
  };
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractMentionedValues(query: string, values: string[]): string[] {
  const normalizedQuery = ` ${normalizeText(query)} `;
  return values
    .sort((a, b) => b.length - a.length)
    .filter((value) => {
      const normalizedValue = normalizeText(value);
      return normalizedValue.length > 1 && normalizedQuery.includes(` ${normalizedValue} `);
    });
}

function detectGIPreference(query: string): GIPreference {
  const q = ` ${normalizeText(query)} `;
  if (
    q.includes(' non gi ') ||
    q.includes(' non-gi ') ||
    q.includes(' without gi ') ||
    q.includes(' not gi ')
  ) {
    return 'non-gi';
  }

  const hasGiIntent =
    q.includes(' gi ') ||
    q.includes(' geographical indication ') ||
    q.includes(' authentic ') ||
    q.includes(' authenticity ') ||
    q.includes(' certified ') ||
    q.includes(' genuine ');

  return hasGiIntent ? 'gi' : 'any';
}

function hasRefinementCue(query: string): boolean {
  const q = ` ${normalizeText(query)} `;
  return (
    q.includes(' only ') ||
    q.includes(' also ') ||
    q.includes(' more ') ||
    q.includes(' show me ') ||
    q.includes(' narrow ') ||
    q.includes(' refine ') ||
    q.includes(' these ') ||
    q.includes(' those ') ||
    q.includes(' them ') ||
    q.includes(' similar ') ||
    q.includes(' in that state ') ||
    q.includes(' in this state ')
  );
}

function tokenize(query: string): string[] {
  return normalizeText(query)
    .split(' ')
    .filter((token) => token.length > 2);
}

function lexicalScore(queryTokens: string[], craft: CraftDoc): number {
  if (queryTokens.length === 0) return 0;
  const haystack = normalizeText(
    [craft.name, craft.state, craft.category, craft.material, craft.technique, craft.summary].join(' ')
  );
  const matches = queryTokens.filter((token) => haystack.includes(token));
  return matches.length / queryTokens.length;
}

function buildFilterSummary(filters: AppliedFilters): string {
  const activeFilters: string[] = [];
  if (filters.states.length) activeFilters.push(`state: ${filters.states.join(', ')}`);
  if (filters.categories.length) activeFilters.push(`category: ${filters.categories.join(', ')}`);
  if (filters.materials.length) activeFilters.push(`material: ${filters.materials.join(', ')}`);
  if (filters.techniques.length) activeFilters.push(`technique: ${filters.techniques.join(', ')}`);
  if (filters.giPreference === 'gi') activeFilters.push('GI only');
  if (filters.giPreference === 'non-gi') activeFilters.push('Non-GI only');

  return activeFilters.length > 0 ? activeFilters.join(' | ') : 'general discovery';
}

function formatCraftList(crafts: CraftDoc[], limit: number): string {
  return crafts.slice(0, limit).map((craft, index) => {
    const giLabel = craft.gi ? 'GI certified' : 'Non-GI';
    return [
      `${index + 1}. ${craft.name} (${craft.state})`,
      `   ${craft.category} | ${craft.material} | ${craft.technique} | ${giLabel}`,
      `   Link: [Open craft page](/detail?id=${craft.id})`,
    ].join('\n');
  }).join('\n\n');
}

function isGreeting(message: string): boolean {
  return /\b(hi|hello|hey|namaste|good morning|good evening)\b/i.test(message);
}

function isThanks(message: string): boolean {
  return /\b(thanks|thank you|appreciate)\b/i.test(message);
}

function isOutOfScope(message: string): boolean {
  return /\b(code|coding|python|javascript|typescript|debug|algorithm|math problem|stock market|medical|legal)\b/i.test(message);
}

function isDetailIntent(message: string): boolean {
  return /\b(about|details|history|tell me about|what is|explain)\b/i.test(message);
}

function isComparisonIntent(message: string): boolean {
  return /\b(compare|difference|vs|versus|better than)\b/i.test(message);
}

function isContextFollowup(message: string): boolean {
  return /\b(above|earlier|previous|you showed|you suggested|those|these|them|first one|second one)\b/i.test(message);
}

function isMetadataQuestion(message: string): boolean {
  return /\b(states?|categories?|materials?|techniques?|gi status|which state|what state)\b/i.test(message);
}

function isHandicraftDomain(message: string): boolean {
  return /\b(craft|handicraft|artisan|gi|geographical indication|textile|pottery|weaving|wood|metal|state|technique|material|history)\b/i.test(message);
}

function buildNoContextReply(): string {
  return [
    'I can help, but I do not have earlier craft suggestions in this chat yet.',
    '',
    'Ask for a recommendation first, such as:',
    '1. "Show GI crafts from Karnataka"',
    '2. "Recommend wood crafts"',
  ].join('\n');
}

function buildMetadataFromCraftsReply(crafts: CraftDoc[], message: string): string {
  const q = normalizeText(message);
  const states = uniqueStrings(crafts.map((craft) => craft.state));
  const categories = uniqueStrings(crafts.map((craft) => craft.category));
  const materials = uniqueStrings(crafts.map((craft) => craft.material));
  const techniques = uniqueStrings(crafts.map((craft) => craft.technique));
  const giCount = crafts.filter((craft) => craft.gi).length;

  if (q.includes('state')) {
    return [
      `The previously shown crafts are from ${states.length} state${states.length > 1 ? 's' : ''}:`,
      ...states.map((state, index) => `${index + 1}. ${state}`),
    ].join('\n');
  }

  if (q.includes('categor')) {
    return [
      'The main categories in the previously shown crafts are:',
      ...categories.map((category, index) => `${index + 1}. ${category}`),
    ].join('\n');
  }

  if (q.includes('material')) {
    return [
      'The materials represented in the previously shown crafts are:',
      ...materials.map((material, index) => `${index + 1}. ${material}`),
    ].join('\n');
  }

  if (q.includes('technique')) {
    return [
      'The techniques used in the previously shown crafts are:',
      ...techniques.map((technique, index) => `${index + 1}. ${technique}`),
    ].join('\n');
  }

  if (q.includes('gi')) {
    return `Out of the previously shown ${crafts.length} crafts, ${giCount} are GI certified and ${crafts.length - giCount} are non-GI.`;
  }

  return [
    'Here is a quick summary of the previously shown crafts:',
    `States: ${states.join(', ')}`,
    `Categories: ${categories.join(', ')}`,
    `Materials: ${materials.join(', ')}`,
    `Techniques: ${techniques.join(', ')}`,
  ].join('\n');
}

function buildConversationalReply(results: CraftDoc[], filters: AppliedFilters, usedDeterministic: boolean): string {
  const filterSummary = buildFilterSummary(filters);

  if (results.length === 0) {
    return [
      'I could not find a strong match in the current catalog for that request.',
      '',
      'Try one of these follow-ups:',
      '1. "Show wood crafts from Andhra Pradesh"',
      '2. "GI certified textile crafts in Kerala"',
      '3. "Compare Pochampally Ikat and Banarasi sarees"',
    ].join('\n');
  }

  const modeLine = usedDeterministic
    ? `I found ${results.length} craft matches using your filters (${filterSummary}).`
    : `I found the most relevant crafts using semantic search (${filterSummary}).`;

  return [
    modeLine,
    '',
    'Top recommendations:',
    formatCraftList(results, 5),
    '',
    'You can continue naturally, for example:',
    '1. "Only GI ones"',
    '2. "Show more from this state"',
    '3. "Tell me the history of the first one"',
  ].join('\n');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();
    const conversationId = (body.conversationId || 'default').trim() || 'default';
    const sessionContext = getSessionContext(conversationId);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await dbConnect();
    await ensureCraftDataSeeded();

    const crafts = await Craft.find({}).lean<CraftDoc[]>();

    sessionContext.lastUserMessages = [...sessionContext.lastUserMessages, message].slice(-8);

    if (isGreeting(message)) {
      return NextResponse.json({
        reply: [
          'Hello! I am your Indian handicrafts assistant.',
          '',
          'I can help you discover crafts by state, category, material, technique, and GI status.',
          'Try asking: "Recommend GI wood crafts" or "Show textile crafts from Kerala".',
        ].join('\n'),
        sources: [],
        appliedFilters: DEFAULT_FILTERS,
      });
    }

    if (isThanks(message)) {
      return NextResponse.json({
        reply: 'You are welcome. If you want, I can suggest crafts by price style, state, or GI preference next.',
        sources: [],
        appliedFilters: cloneFilters(sessionContext.lastFilters),
      });
    }

    if (isOutOfScope(message)) {
      return NextResponse.json({
        reply: [
          'I focus only on Indian handicrafts in this portal.',
          '',
          'I can help with craft discovery, comparison, history, GI context, and recommendations from the catalog.',
        ].join('\n'),
        sources: [],
        appliedFilters: cloneFilters(sessionContext.lastFilters),
      });
    }

    if (crafts.length === 0) {
      return NextResponse.json({
        reply: 'The craft catalog is currently empty. Please seed data first and try again.',
        sources: [],
      });
    }

    const states = Array.from(new Set(crafts.map((craft) => craft.state))).filter(Boolean);
    const categories = Array.from(new Set(crafts.map((craft) => craft.category))).filter(Boolean);
    const materials = Array.from(new Set(crafts.map((craft) => craft.material))).filter(Boolean);
    const techniques = Array.from(new Set(crafts.map((craft) => craft.technique))).filter(Boolean);
    const craftNames = Array.from(new Set(crafts.map((craft) => craft.name))).filter(Boolean);

    if (isContextFollowup(message) && isMetadataQuestion(message)) {
      const previousCrafts = crafts.filter((craft) => sessionContext.lastShownCraftIds.includes(craft.id));

      if (previousCrafts.length === 0) {
        return NextResponse.json({
          reply: buildNoContextReply(),
          sources: [],
          appliedFilters: cloneFilters(sessionContext.lastFilters),
        });
      }

      return NextResponse.json({
        reply: buildMetadataFromCraftsReply(previousCrafts, message),
        sources: previousCrafts.slice(0, 6).map((craft) => ({
          id: craft.id,
          name: craft.name,
          state: craft.state,
          category: craft.category,
          gi: craft.gi,
        })),
        appliedFilters: cloneFilters(sessionContext.lastFilters),
      });
    }

    const mentionedCraftNames = extractMentionedValues(message, craftNames);

    if (isDetailIntent(message) && mentionedCraftNames.length === 1) {
      const selectedCraft = crafts.find(
        (craft) => normalizeText(craft.name) === normalizeText(mentionedCraftNames[0])
      );

      if (selectedCraft) {
        sessionContext.lastShownCraftIds = [selectedCraft.id];
        sessionContext.lastFilters = {
          states: [selectedCraft.state],
          categories: [selectedCraft.category],
          materials: [selectedCraft.material],
          techniques: [selectedCraft.technique],
          giPreference: selectedCraft.gi ? 'gi' : 'non-gi',
        };
        saveSessionContext(conversationId, sessionContext);

        return NextResponse.json({
          reply: [
            `${selectedCraft.name} is a ${selectedCraft.category} craft from ${selectedCraft.state}.`,
            '',
            `Summary: ${selectedCraft.summary}`,
            '',
            `History: ${selectedCraft.history || 'Historical information is limited in the current dataset.'}`,
            '',
            `Link: [Open craft page](/detail?id=${selectedCraft.id})`,
          ].join('\n'),
          sources: [
            {
              id: selectedCraft.id,
              name: selectedCraft.name,
              state: selectedCraft.state,
              category: selectedCraft.category,
              gi: selectedCraft.gi,
            },
          ],
          appliedFilters: {
            states: [selectedCraft.state],
            categories: [selectedCraft.category],
            materials: [selectedCraft.material],
            techniques: [selectedCraft.technique],
            giPreference: selectedCraft.gi ? 'gi' : 'non-gi',
          },
        });
      }
    }

    if (isComparisonIntent(message) && mentionedCraftNames.length >= 2) {
      const compareCrafts = mentionedCraftNames
        .slice(0, 2)
        .map((name) => crafts.find((craft) => normalizeText(craft.name) === normalizeText(name)))
        .filter((craft): craft is CraftDoc => Boolean(craft));

      if (compareCrafts.length === 2) {
        const [a, b] = compareCrafts;
        sessionContext.lastShownCraftIds = [a.id, b.id];
        sessionContext.lastFilters = {
          states: uniqueStrings([a.state, b.state]),
          categories: uniqueStrings([a.category, b.category]),
          materials: uniqueStrings([a.material, b.material]),
          techniques: uniqueStrings([a.technique, b.technique]),
          giPreference: 'any',
        };
        saveSessionContext(conversationId, sessionContext);

        return NextResponse.json({
          reply: [
            `Comparison: ${a.name} vs ${b.name}`,
            '',
            `1. ${a.name}`,
            `   State: ${a.state}`,
            `   Category: ${a.category}`,
            `   Material/Technique: ${a.material} / ${a.technique}`,
            `   GI: ${a.gi ? 'Yes' : 'No'}`,
            `   Link: [Open craft page](/detail?id=${a.id})`,
            '',
            `2. ${b.name}`,
            `   State: ${b.state}`,
            `   Category: ${b.category}`,
            `   Material/Technique: ${b.material} / ${b.technique}`,
            `   GI: ${b.gi ? 'Yes' : 'No'}`,
            `   Link: [Open craft page](/detail?id=${b.id})`,
          ].join('\n'),
          sources: [
            { id: a.id, name: a.name, state: a.state, category: a.category, gi: a.gi },
            { id: b.id, name: b.name, state: b.state, category: b.category, gi: b.gi },
          ],
          appliedFilters: {
            states: uniqueStrings([a.state, b.state]),
            categories: uniqueStrings([a.category, b.category]),
            materials: uniqueStrings([a.material, b.material]),
            techniques: uniqueStrings([a.technique, b.technique]),
            giPreference: 'any' as GIPreference,
          },
        });
      }
    }

    const stateMentions = extractMentionedValues(message, states);
    const categoryMentions = extractMentionedValues(message, categories);
    const materialMentions = extractMentionedValues(message, materials);
    const techniqueMentions = extractMentionedValues(message, techniques);
    const giFromMessage = detectGIPreference(message);

    const refinementMode = hasRefinementCue(message);
    const inheritedFilters = refinementMode
      ? (body.contextFilters || sessionContext.lastFilters)
      : undefined;

    const selectedState = (body.selectedState || '').trim();
    const selectedStateFilter =
      selectedState && selectedState.toLowerCase() !== 'all' && stateMentions.length === 0 && !inheritedFilters?.states?.length
        ? [selectedState]
        : [];

    const filters: AppliedFilters = {
      states: uniqueStrings([...(inheritedFilters?.states || []), ...stateMentions, ...selectedStateFilter]),
      categories: uniqueStrings([...(inheritedFilters?.categories || []), ...categoryMentions]),
      materials: uniqueStrings([...(inheritedFilters?.materials || []), ...materialMentions]),
      techniques: uniqueStrings([...(inheritedFilters?.techniques || []), ...techniqueMentions]),
      giPreference: giFromMessage !== 'any' ? giFromMessage : (inheritedFilters?.giPreference || 'any'),
    };

    const deterministicResults = crafts.filter((craft) => {
      if (
        filters.states.length > 0 &&
        !filters.states.some((state) => normalizeText(state) === normalizeText(craft.state))
      ) {
        return false;
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.some((category) => normalizeText(category) === normalizeText(craft.category))
      ) {
        return false;
      }
      if (
        filters.materials.length > 0 &&
        !filters.materials.some((material) => normalizeText(material) === normalizeText(craft.material))
      ) {
        return false;
      }
      if (
        filters.techniques.length > 0 &&
        !filters.techniques.some((technique) => normalizeText(technique) === normalizeText(craft.technique))
      ) {
        return false;
      }
      if (filters.giPreference === 'gi' && !craft.gi) {
        return false;
      }
      if (filters.giPreference === 'non-gi' && craft.gi) {
        return false;
      }
      return true;
    });

    const explicitSignalsPresent =
      stateMentions.length > 0 ||
      categoryMentions.length > 0 ||
      materialMentions.length > 0 ||
      techniqueMentions.length > 0 ||
      giFromMessage !== 'any' ||
      selectedStateFilter.length > 0 ||
      Boolean(inheritedFilters);

    const usedDeterministic = deterministicResults.length > 0 &&
      explicitSignalsPresent;

    let rankedResults: CraftDoc[] = deterministicResults;

    if (!usedDeterministic) {
      const queryTokens = tokenize(message);
      const queryEmbedding = await generateEmbedding(message);

      const scored = crafts
        .map((craft) => {
          const semantic =
            craft.embedding && craft.embedding.length > 0
              ? calculateSimilarity(queryEmbedding, craft.embedding)
              : 0;
          const lexical = lexicalScore(queryTokens, craft);
          const score = semantic * 0.75 + lexical * 0.25;
          return { craft, score };
        })
        .sort((a, b) => b.score - a.score);

      const topScore = scored[0]?.score ?? 0;
      const cutoff = Math.max(0.12, topScore * 0.55);

      const mostlyUnrelated = topScore < 0.22 && !isHandicraftDomain(message) && !isContextFollowup(message);

      if (mostlyUnrelated) {
        return NextResponse.json({
          reply: [
            'I can chat naturally, but I stay focused on Indian handicrafts in this portal.',
            '',
            'Try asking about states, techniques, materials, GI status, or craft comparisons.',
          ].join('\n'),
          sources: [],
          appliedFilters: cloneFilters(sessionContext.lastFilters),
        });
      }

      rankedResults = scored
        .filter((item) => item.score >= cutoff)
        .slice(0, 8)
        .map((item) => item.craft);
    } else {
      rankedResults = rankedResults.slice(0, 8);
    }

    const reply = buildConversationalReply(rankedResults, filters, usedDeterministic);

    const sources = rankedResults.slice(0, 6).map((craft) => ({
      id: craft.id,
      name: craft.name,
      state: craft.state,
      category: craft.category,
      gi: craft.gi,
    }));

    sessionContext.lastFilters = cloneFilters(filters);
    sessionContext.lastShownCraftIds = rankedResults.slice(0, 8).map((craft) => craft.id);
    saveSessionContext(conversationId, sessionContext);

    return NextResponse.json({
      reply,
      mode: usedDeterministic ? 'deterministic' : 'retrieval',
      appliedFilters: filters,
      sources,
      resultCount: rankedResults.length,
      language: body.language || 'English',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}