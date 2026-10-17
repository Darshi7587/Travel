const COUNTRY_RECOMMENDATION_IDS = new Set(['toronto', 'paris', 'tokyo', 'bali']);
const SEARCH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'for', 'in', 'of', 'the', 'to', 'with',
  'destination', 'destinations', 'different', 'famous', 'historical',
  'historic', 'international', 'popular', 'recommendation', 'recommendations',
]);

export function normalizeText(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function singularizeToken(token) {
  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (/(?:sh|ch|ss|x|z)es$/.test(token)) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && !/(?:ss|us|is)$/.test(token) && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

function getQueryDetails(query) {
  const normalized = normalizeText(query);
  const tokens = normalized.split(' ').filter(Boolean).map(singularizeToken);
  const hasToken = (...terms) => tokens.some((token) => terms.includes(token));
  const beachTerms = ['beach', 'coast', 'coastal', 'shore', 'seaside'];
  const templeTerms = ['temple', 'shrine', 'sacred'];
  const countryTerms = ['country', 'international'];
  const intents = {
    beaches: hasToken(...beachTerms),
    temples: hasToken(...templeTerms),
    countries: hasToken(...countryTerms),
  };
  const intentTerms = new Set([
    ...(intents.beaches ? beachTerms : []),
    ...(intents.temples ? templeTerms : []),
    ...(intents.countries ? countryTerms : []),
  ]);
  const meaningfulTokens = [...new Set(tokens.filter(
    (token) => !SEARCH_STOP_WORDS.has(token) && !intentTerms.has(token),
  ))];

  return { normalized, tokens, intents, meaningfulTokens };
}

function getSearchableText(destination) {
  return normalizeText([
    destination.name,
    destination.city,
    destination.country,
    destination.category,
    destination.description,
    destination.bestTime,
    ...(destination.attractions || []),
    ...(destination.activities || []),
    ...(destination.keywords || []),
  ].join(' '));
}

export function filterDestinations({
  destinations,
  query = '',
  category = 'all',
  favorites = new Set(),
  favoriteOnly = false,
}) {
  const { normalized, tokens, intents, meaningfulTokens } = getQueryDetails(query);
  const hasIntent = intents.beaches || intents.temples || intents.countries;

  let filtered = destinations.filter((destination) => {
    const matchesCategory = category === 'all' || destination.category === category;
    const matchesFavorite = !favoriteOnly || favorites.has(destination.id);
    const matchesIntentCategory = !((intents.beaches || intents.temples) && !(
      (intents.beaches && destination.category === 'beaches')
      || (intents.temples && destination.category === 'temples')
    ));
    const matchesCountryIntent = !intents.countries || COUNTRY_RECOMMENDATION_IDS.has(destination.id);

    if (!matchesCategory || !matchesFavorite || !matchesIntentCategory || !matchesCountryIntent) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    if (hasIntent) {
      return true;
    }

    const searchableText = getSearchableText(destination);
    const searchableTokens = new Set(searchableText.split(' ').map(singularizeToken));
    return searchableText.includes(normalized) || tokens.every((token) => searchableTokens.has(token));
  });

  if (hasIntent && meaningfulTokens.length) {
    filtered = filtered.filter((destination) => {
      const searchableTokens = new Set(getSearchableText(destination).split(' ').map(singularizeToken));
      return meaningfulTokens.every((token) => searchableTokens.has(token));
    });
  }

  return filtered;
}

export function setStatusMessage(element, message) {
  if (!element) return;
  element.textContent = message;
}

export function renderStatusMessage(element, destinations, query, category, favoriteOnly) {
  if (!element) return;

  const total = destinations.length;
  const categoryLabel = {
    beaches: 'beach',
    temples: 'temple',
    cities: 'city',
  }[category];
  const resultLabel = categoryLabel ? `${categoryLabel} destinations` : 'destinations';

  if (query) {
    const scope = favoriteOnly ? 'favorite' : 'matching';
    element.textContent = `${total} ${scope} ${resultLabel} for “${query}”.`;
    return;
  }

  if (favoriteOnly) {
    element.textContent = `${total} favorite ${resultLabel}.`;
    return;
  }

  if (category === 'all') {
    element.textContent = `${total} destination recommendations available.`;
    return;
  }

  element.textContent = `${total} ${categoryLabel} destinations available.`;
}
