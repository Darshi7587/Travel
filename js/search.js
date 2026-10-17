export function normalizeText(text = '') {
  return String(text).trim().toLowerCase();
}

export function filterDestinations({ destinations, query = '', category = 'all', favorites = new Set(), favoriteOnly = false }) {
  const normalizedQuery = normalizeText(query);

  let filtered = destinations.filter((destination) => {
    const matchesCategory = category === 'all' || destination.category === category;
    const matchesFavorite = !favoriteOnly || favorites.has(destination.id);
    if (!matchesCategory || !matchesFavorite) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      destination.name,
      destination.city,
      destination.country,
      destination.category,
      destination.description,
      destination.bestTime,
      ...(destination.attractions || []),
      ...(destination.activities || []),
      ...(destination.keywords || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return filtered;
}

export function setStatusMessage(element, message) {
  if (!element) return;
  element.textContent = message;
}

export function renderStatusMessage(element, destinations, query, category, favoriteOnly) {
  if (!element) return;

  const total = destinations.length;
  const categoryLabel = category === 'all' ? 'all destinations' : `${category} destinations`;
  const scope = favoriteOnly ? 'favorite' : 'matching';

  if (query) {
    element.textContent = `${total} ${scope} ${categoryLabel} for “${query}”.`;
    return;
  }

  if (favoriteOnly) {
    element.textContent = `${total} favorite ${categoryLabel}.`;
    return;
  }

  if (category === 'all') {
    element.textContent = `${total} destination recommendations available.`;
    return;
  }

  element.textContent = `${total} ${category} destinations available.`;
}
