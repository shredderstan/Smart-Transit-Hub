import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function StopPickerMap({ latitude, longitude, onSelectLocation, height = '260px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const defaultLat = latitude && !isNaN(latitude) ? parseFloat(latitude) : 18.5204;
  const defaultLng = longitude && !isNaN(longitude) ? parseFloat(longitude) : 73.8567;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Handle map click to pick location
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onSelectLocation) {
          onSelectLocation({ latitude: lat, longitude: lng });
        }
      });

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, []);

  // Update marker position when lat/lng props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = latitude && !isNaN(latitude) ? parseFloat(latitude) : null;
    const lng = longitude && !isNaN(longitude) ? parseFloat(longitude) : null;

    if (lat !== null && lng !== null) {
      const pinHtml = `
        <div style="
          width: 32px; height: 32px;
          border-radius: 50% 50% 50% 0;
          background: #f59e0b;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%; top: 50%;
          margin: -20px 0 0 -16px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff; transform: rotate(45deg);"></div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-picker-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [latitude, longitude]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: 600,
        boxShadow: 'var(--shadow-sm)'
      }}>
        💡 Click map to set coordinates
      </div>
    </div>
  );
}
