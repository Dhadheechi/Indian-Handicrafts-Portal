type SupportedLanguage = 'English' | 'Hindi' | 'Telugu' | 'Tamil' | 'Malayalam' | 'Odia';

type TranslationDirection = 'indic-en' | 'en-indic';

type TranslateOptions = {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
};

const INDIC_LANG_CODES: Record<Exclude<SupportedLanguage, 'English'>, string> = {
  Hindi: 'hin_Deva',
  Telugu: 'tel_Telu',
  Tamil: 'tam_Taml',
  Malayalam: 'mal_Mlym',
  Odia: 'ory_Orya',
};

const ENGLISH_CODE = 'eng_Latn';

const INDIC_EN_MODEL = process.env.INDICTRANS2_INDIC_EN_MODEL || 'ai4bharat/indictrans2-indic-en-dist-200M';
const EN_INDIC_MODEL = process.env.INDICTRANS2_EN_INDIC_MODEL || 'ai4bharat/indictrans2-en-indic-dist-200M';

const CUSTOM_ENDPOINT = process.env.INDICTRANS2_ENDPOINT_URL;
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN;
const HF_API_BASE = process.env.HUGGING_FACE_API_BASE || 'https://api-inference.huggingface.co/models';

const responseCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 1000;

function getLanguageCode(language: SupportedLanguage): string {
  if (language === 'English') {
    return ENGLISH_CODE;
  }
  return INDIC_LANG_CODES[language];
}

function trimForModel(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function makeCacheKey(model: string, srcLang: string, tgtLang: string, text: string): string {
  return `${model}::${srcLang}::${tgtLang}::${text}`;
}

function cachePut(key: string, value: string): void {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }
  responseCache.set(key, value);
}

async function callCustomEndpoint(
  model: string,
  srcLang: string,
  tgtLang: string,
  text: string
): Promise<string | null> {
  if (!CUSTOM_ENDPOINT) {
    return null;
  }

  const response = await fetch(CUSTOM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      text,
      src_lang: srcLang,
      tgt_lang: tgtLang,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndicTrans2 endpoint error (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as
    | { translatedText?: string; translation?: string; text?: string }
    | Array<{ translatedText?: string; translation?: string; text?: string }>;

  if (Array.isArray(payload)) {
    const first = payload[0];
    return first?.translatedText || first?.translation || first?.text || null;
  }

  return payload.translatedText || payload.translation || payload.text || null;
}

async function callHuggingFaceInference(
  model: string,
  srcLang: string,
  tgtLang: string,
  text: string
): Promise<string | null> {
  if (!HF_TOKEN) {
    return null;
  }

  const response = await fetch(`${HF_API_BASE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      parameters: {
        src_lang: srcLang,
        tgt_lang: tgtLang,
      },
      options: {
        wait_for_model: true,
        use_cache: true,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HF IndicTrans2 inference error (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as
    | Array<{ generated_text?: string; translation_text?: string }>
    | { generated_text?: string; translation_text?: string };

  if (Array.isArray(payload)) {
    return payload[0]?.translation_text || payload[0]?.generated_text || null;
  }

  return payload.translation_text || payload.generated_text || null;
}

async function translateRaw(
  direction: TranslationDirection,
  srcLang: string,
  tgtLang: string,
  text: string
): Promise<string> {
  const normalized = trimForModel(text);
  if (!normalized) {
    return text;
  }

  const model = direction === 'indic-en' ? INDIC_EN_MODEL : EN_INDIC_MODEL;
  const cacheKey = makeCacheKey(model, srcLang, tgtLang, normalized);
  const cached = responseCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let translated = await callCustomEndpoint(model, srcLang, tgtLang, normalized);
  if (!translated) {
    translated = await callHuggingFaceInference(model, srcLang, tgtLang, normalized);
  }

  const safeText = translated?.trim() || text;
  cachePut(cacheKey, safeText);
  return safeText;
}

async function translatePreservingMarkdownLinks(
  text: string,
  translatePart: (value: string) => Promise<string>
): Promise<string> {
  const chunks = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      if (/^\[[^\]]+\]\([^)]+\)$/.test(chunk)) {
        return chunk;
      }
      return translatePart(chunk);
    })
  );
  return translatedChunks.join('');
}

export async function translateBetweenLanguages({
  text,
  sourceLanguage,
  targetLanguage,
}: TranslateOptions): Promise<string> {
  if (!text.trim() || sourceLanguage === targetLanguage) {
    return text;
  }

  const sourceCode = getLanguageCode(sourceLanguage);
  const targetCode = getLanguageCode(targetLanguage);

  const direction: TranslationDirection = sourceLanguage === 'English' ? 'en-indic' : 'indic-en';

  try {
    return await translatePreservingMarkdownLinks(text, (part) =>
      translateRaw(direction, sourceCode, targetCode, part)
    );
  } catch (error) {
    console.warn('IndicTrans2 translation failed; returning original text.', error);
    return text;
  }
}

export function normalizeUiLanguage(language?: string): SupportedLanguage {
  switch ((language || '').trim()) {
    case 'Hindi':
    case 'Telugu':
    case 'Tamil':
    case 'Malayalam':
    case 'Odia':
      return language as SupportedLanguage;
    default:
      return 'English';
  }
}
