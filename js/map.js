export function initializeMap() {
  const mapElement = document.getElementById('office-map');
  const fallback = document.getElementById('map-fallback');

  if (!mapElement) return;

  if (!window.L) {
    if (fallback) {
      fallback.hidden = false;
    }
    return;
  }

  try {
    const map = L.map('office-map', {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([20.5937, 78.9629], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const officeLocations = [
      {
        name: 'Bengaluru Sample Office',
        description: 'Sample office location for design and planning teams.',
        coords: [12.9716, 77.5946],
      },
      {
        name: 'Toronto Sample Office',
        description: 'Sample office location for customer and partner outreach.',
        coords: [43.6532, -79.3832],
      },
    ];

    officeLocations.forEach((office) => {
      const marker = L.marker(office.coords).addTo(map);
      marker.bindPopup(`<strong>${office.name}</strong><br>${office.description}`);
    });
  } catch (error) {
    console.warn('Leaflet map failed to initialize:', error);
    if (fallback) {
      fallback.hidden = false;
    }
  }
}
