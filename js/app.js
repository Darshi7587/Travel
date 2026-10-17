import { DESTINATIONS } from './data.js';
import { filterDestinations, renderStatusMessage } from './search.js';
import { renderDestinationGrid, openDestinationModal, getDestinationTime } from './destinations.js';
import { loadFavorites, toggleFavorite, isFavorite } from './favorites.js';
import { initializeContactForm } from './contact.js';
import { initializeMap } from './map.js';

const state = {
  category: 'all',
  query: '',
  notes: '',
  favoriteOnly: false,
  favorites: new Set(loadFavorites()),
};

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const resultStatus = document.getElementById('results-status');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('destination-search');
const travelNotes = document.getElementById('travel-notes');
const searchFeedback = document.getElementById('search-feedback');
const clearSearchButton = document.getElementById('clear-search');
const categoryButtons = document.querySelectorAll('.category-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const tagButtons = document.querySelectorAll('.tag-btn');
const categoryLinks = document.querySelectorAll('[data-category-link]');
const backToTopButton = document.getElementById('back-to-top');
const modal = document.getElementById('destination-modal');
const modalFavoriteButton = document.getElementById('modal-favorite-btn');

function updateCategoryButtons() {
  categoryButtons.forEach((button) => {
    const isActive = button.dataset.category === state.category;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === (state.favoriteOnly ? 'favorites' : state.category);
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  navLinks.forEach((link) => {
    const section = link.getAttribute('href');
    const active = section === '#home' && state.category === 'all';
    link.classList.toggle('active', active || (section === '#about' && state.category === 'all'));
  });
}

function renderResults() {
  const combinedQuery = [state.query, state.notes]
    .filter(Boolean)
    .join(' ');

  const filtered = filterDestinations({
    destinations: DESTINATIONS,
    query: combinedQuery,
    category: state.category,
    favorites: state.favorites,
    favoriteOnly: state.favoriteOnly,
  });

  renderDestinationGrid({
    destinations: filtered,
    favorites: state.favorites,
    onFavoriteToggle: (destinationId) => {
      state.favorites = toggleFavorite(destinationId, state.favorites);
      renderResults();
      if (modal && modal.classList.contains('is-open')) {
        const activeDestination = DESTINATIONS.find((item) => item.id === destinationId);
        if (activeDestination) {
          document.body.dataset.favoriteSet = [...state.favorites].join(',');
          const currentHeart = modalFavoriteButton?.querySelector('i');
          if (currentHeart) {
            currentHeart.className = isFavorite(destinationId, state.favorites) ? 'fas fa-heart' : 'far fa-heart';
          }
          modalFavoriteButton?.classList.toggle('active', isFavorite(destinationId, state.favorites));
        }
      }
    },
    onViewDetails: (destination) => {
      document.body.dataset.favoriteSet = [...state.favorites].join(',');
      openDestinationModal(destination);
      const modalHeart = document.getElementById('modal-favorite-btn');
      if (modalHeart) {
        modalHeart.classList.toggle('active', isFavorite(destination.id, state.favorites));
        modalHeart.innerHTML = `<i class="${isFavorite(destination.id, state.favorites) ? 'fas fa-heart' : 'far fa-heart'}"></i>`;
      }
      modalHeart?.addEventListener('click', () => {
        state.favorites = toggleFavorite(destination.id, state.favorites);
        modalHeart.classList.toggle('active', isFavorite(destination.id, state.favorites));
        modalHeart.innerHTML = `<i class="${isFavorite(destination.id, state.favorites) ? 'fas fa-heart' : 'far fa-heart'}"></i>`;
        renderResults();
      }, { once: true });
    },
  });

  renderStatusMessage(resultStatus, filtered, combinedQuery, state.category, state.favoriteOnly);
  updateCategoryButtons();
}

function attachNavigation() {
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu) {
        navMenu.classList.remove('open');
      }
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  categoryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetCategory = link.dataset.categoryLink;
      if (targetCategory) {
        state.favoriteOnly = false;
        state.category = targetCategory;
        renderResults();
        document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function attachSearchListeners() {
  if (searchInput && searchForm) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        searchForm.requestSubmit();
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = searchInput ? searchInput.value.trim() : '';
      const notesValue = travelNotes ? travelNotes.value.trim() : '';
      const combinedInput = [inputValue, notesValue].filter(Boolean).join(' ');

      if (!combinedInput) {
        if (searchFeedback) {
          searchFeedback.textContent = 'Please enter a destination, city, or travel interest.';
        }
        return;
      }

      state.query = inputValue;
      state.notes = notesValue;
      state.favoriteOnly = false;
      if (searchFeedback) {
        searchFeedback.textContent = 'Showing tailored destinations based on your search.';
      }
      renderResults();
    });
  }

  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', () => {
      state.query = '';
      state.notes = '';
      state.category = 'all';
      state.favoriteOnly = false;
      if (searchInput) searchInput.value = '';
      if (travelNotes) travelNotes.value = '';
      if (searchFeedback) searchFeedback.textContent = 'Search cleared. Popular recommendations restored.';
      renderResults();
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextCategory = button.dataset.category;
      state.query = searchInput ? searchInput.value.trim() : '';
      state.notes = travelNotes ? travelNotes.value.trim() : '';
      state.category = nextCategory || 'all';
      state.favoriteOnly = false;
      renderResults();
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      state.query = searchInput ? searchInput.value.trim() : '';
      state.notes = travelNotes ? travelNotes.value.trim() : '';
      if (filter === 'favorites') {
        state.favoriteOnly = true;
        state.category = 'all';
      } else {
        state.favoriteOnly = false;
        state.category = filter || 'all';
      }
      renderResults();
    });
  });

  tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const term = button.dataset.search;
      if (searchInput) {
        searchInput.value = term;
      }
      state.query = term;
      state.notes = travelNotes ? travelNotes.value.trim() : '';
      renderResults();
      if (searchFeedback) {
        searchFeedback.textContent = 'Popular suggestion applied.';
      }
    });
  });
}

function attachBackToTop() {
  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initializeModalBehavior() {
  if (!modal) return;

  modal.addEventListener('click', (event) => {
    const closeTarget = event.target instanceof HTMLElement && event.target.dataset.closeModal === 'true';
    if (closeTarget || event.target === modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  const closeButton = modal.querySelector('.modal-close');
  closeButton?.addEventListener('click', () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

function updateTimeDisplay() {
  const timeLabel = document.getElementById('modal-local-time');
  if (!timeLabel || !modal?.classList.contains('is-open')) return;

  const destination = DESTINATIONS.find((item) => item.name === document.getElementById('modal-title')?.textContent?.trim());
  if (destination?.timezone) {
    timeLabel.textContent = getDestinationTime(destination.timezone);
  }
}

function initializeTimeUpdates() {
  setInterval(() => {
    updateTimeDisplay();
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  attachNavigation();
  attachSearchListeners();
  attachBackToTop();
  initializeModalBehavior();
  initializeContactForm();
  initializeMap();
  initializeTimeUpdates();
  renderResults();
});
