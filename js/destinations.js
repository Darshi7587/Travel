const IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#d7f2f5"/><stop offset="1" stop-color="#f4ead8"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="890" cy="180" r="78" fill="#f2bc74"/><path d="M0 540 260 290l180 190 190-250 330 330 240-180v420H0Z" fill="#557e7a"/><path d="m0 650 300-180 230 155 230-140 440 205v110H0Z" fill="#8bb8ae"/><path d="M0 700q220-70 440 0t440 0 320 0v100H0Z" fill="#d8e9d9"/></svg>',
)}`

function attachImageFallback(image, description) {
  image.onerror = () => {
    image.onerror = null;
    image.src = IMAGE_FALLBACK;
    image.alt = `${description}; image unavailable, showing a scenic placeholder`;
  };
}

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
      <img src="${destination.image}" alt="${destination.name}, ${destination.city}, ${destination.country}" loading="lazy" decoding="async" />
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

    const image = card.querySelector('img');
    if (image) {
      attachImageFallback(image, `${destination.name}, ${destination.city}, ${destination.country}`);
    }

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
  image.alt = `${destination.name} destination photo`;
  attachImageFallback(image, `${destination.name} destination photo`);
  image.src = destination.image;
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
