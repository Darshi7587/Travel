const STORAGE_KEY = 'wanderwise-favorites';

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load favorites:', error);
    return [];
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(favorites)]));
  } catch (error) {
    console.warn('Unable to save favorites:', error);
  }
}

export function toggleFavorite(destinationId, favorites) {
  const nextFavorites = new Set(favorites);
  if (nextFavorites.has(destinationId)) {
    nextFavorites.delete(destinationId);
  } else {
    nextFavorites.add(destinationId);
  }
  saveFavorites([...nextFavorites]);
  return nextFavorites;
}

export function isFavorite(destinationId, favorites) {
  return favorites.has(destinationId);
}
