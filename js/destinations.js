export function renderDestinationGrid({ destinations, favorites, onFavoriteToggle, onViewDetails }) {
  const grid = document.getElementById('destinations-grid');
  const emptyState = document.getElementById('empty-state');

  if (!grid) return;

  grid.innerHTML = '';

  if (!destinations.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  destinations.forEach((destination) => {
    const card = document.createElement('article');
    card.className = 'destination-card';
    card.innerHTML = `
      <button class="favorite-btn ${favorites.has(destination.id) ? 'active' : ''}" type="button" data-favorite-id="${destination.id}" aria-label="Toggle favorite for ${destination.name}">
        <i class="${favorites.has(destination.id) ? 'fas fa-heart' : 'far fa-heart'}"></i>
      </button>
      <img src="${destination.image}" alt="${destination.name} scenic destination" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';" />
      <div class="card-body">
        <div class="card-header">
          <span class="category-badge">${destination.category}</span>
        </div>
        <h3>${destination.name}</h3>
        <p class="location-line">${destination.city}, ${destination.country}</p>
        <p class="description">${destination.description}</p>
        <ul class="meta-list">
          <li><i class="fa-solid fa-clock"></i>Best time: ${destination.bestTime}</li>
          <li><i class="fa-solid fa-location-dot"></i>Top sights: ${destination.attractions.slice(0, 2).join(', ')}</li>
        </ul>
        <div class="card-actions">
          <button class="outline-btn view-details" type="button" data-destination-id="${destination.id}">View Details</button>
        </div>
      </div>
    `;

    const favoriteButton = card.querySelector('.favorite-btn');
    favoriteButton.addEventListener('click', (event) => {
      event.preventDefault();
      onFavoriteToggle(destination.id);
    });

    const detailButton = card.querySelector('.view-details');
    detailButton.addEventListener('click', () => onViewDetails(destination));

    grid.appendChild(card);
  });
}

export function openDestinationModal(destination) {
  const modal = document.getElementById('destination-modal');
  if (!modal || !destination) return;

  const title = document.getElementById('modal-title');
  const category = document.getElementById('modal-category');
  const location = document.getElementById('modal-location');
  const description = document.getElementById('modal-description');
  const image = document.getElementById('modal-image');
  const bestTime = document.getElementById('modal-best-time');
  const localTime = document.getElementById('modal-local-time');
  const attractions = document.getElementById('modal-attractions');
  const activities = document.getElementById('modal-activities');
  const tips = document.getElementById('modal-tips');
  const mapLink = document.getElementById('modal-map-link');
  const favoriteButton = document.getElementById('modal-favorite-btn');

  title.textContent = destination.name;
  category.textContent = destination.category;
  location.textContent = `${destination.city}, ${destination.country}`;
  description.textContent = destination.description;
  image.src = destination.image;
  image.alt = `${destination.name} destination photo`;
  bestTime.textContent = destination.bestTime;

  attractions.innerHTML = destination.attractions.map((item) => `<li>${item}</li>`).join('');
  activities.innerHTML = destination.activities.map((item) => `<li>${item}</li>`).join('');
  tips.innerHTML = destination.tips.map((item) => `<li>${item}</li>`).join('');

  const baseMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.city} ${destination.country}`)}`;
  mapLink.href = baseMapUrl;

  const position = destination.timezone ? getDestinationTime(destination.timezone) : 'Time unavailable';
  localTime.textContent = position;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  if (favoriteButton) {
    favoriteButton.classList.toggle('active', document.body.dataset.favoriteSet?.includes(destination.id) || false);
    favoriteButton.innerHTML = `<i class="${document.body.dataset.favoriteSet?.includes(destination.id) ? 'fas fa-heart' : 'far fa-heart'}"></i>`;
  }

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  document.querySelector('.modal-close')?.addEventListener('click', closeModal, { once: true });
  modal.querySelector('[data-close-modal="true"]')?.addEventListener('click', closeModal, { once: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  }, { once: true });
}

export function getDestinationTime(timezone) {
  if (!timezone) return 'Time unavailable';

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    return formatter.format(new Date());
  } catch (error) {
    console.warn('Time zone formatting unavailable:', error);
    return 'Time unavailable';
  }
}
