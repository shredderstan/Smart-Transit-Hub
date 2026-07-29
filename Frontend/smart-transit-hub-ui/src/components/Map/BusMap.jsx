import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Radio, ShieldCheck } from 'lucide-react';

export default function BusMap({ busLocation, routeStops, activeBusNumber, height = '450px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const polylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default initial view: San Francisco Bay Area (or center of stops)
      const defaultCenter = [37.7849, -122.4100];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false
      });

      // Add clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update Route Polylines and Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeStops || routeStops.length === 0) return;

    // Clear existing stop markers
    stopMarkersRef.current.forEach(marker => map.removeLayer(marker));
    stopMarkersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const latLngs = routeStops.map(s => [s.latitude, s.longitude]);

    // Draw yellow/amber route polyline
    const polyline = L.polyline(latLngs, {
      color: '#f59e0b',
      weight: 5,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineRef.current = polyline;

    // Add Stop Pins
    routeStops.forEach((stop, index) => {
      const isNextStop = busLocation && busLocation.nextStopId === stop.id;
      
      const customStopHtml = `
        <div class="stop-marker-pin ${isNextStop ? 'active' : ''}">
          ${index + 1}
        </div>
      `;

      const stopIcon = L.divIcon({
        html: customStopHtml,
        className: 'custom-stop-divicon',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: var(--font-family); padding: 4px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Stop #${index + 1}</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${stop.stopName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Sequence Order: ${stop.sequenceOrder}</div>
          </div>
        `);

      stopMarkersRef.current.push(marker);
    });

    // Fit Map to Route Bounds if bus is not active yet
    if (!busLocation && latLngs.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routeStops]);

  // Update Animated Bus Marker & Pan Location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !busLocation || !busLocation.latitude || !busLocation.longitude) return;

    const busLatLng = [busLocation.latitude, busLocation.longitude];

    const busHtml = `
      <div class="bus-icon-wrapper">
        <div class="bus-icon-pulse"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M15 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2C2.5 16.3 3 18 3 18h3"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busHtml,
      className: 'custom-bus-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!busMarkerRef.current) {
      // Create new bus marker
      const marker = L.marker(busLatLng, { icon: busIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: var(--font-family); padding: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">LIVE VEHICLE</span>
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">Bus ${activeBusNumber || 'BUS-101'}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Speed: <strong>${Math.round(busLocation.speed || 0)} km/h</strong></div>
            ${busLocation.nextStopName ? `<div style="font-size: 12px; color: #b45309; margin-top: 2px;">Next: <strong>${busLocation.nextStopName}</strong></div>` : ''}
          </div>
        `);
      busMarkerRef.current = marker;
      map.panTo(busLatLng);
    } else {
      // Smoothly update location
      busMarkerRef.current.setLatLng(busLatLng);
      busMarkerRef.current.setIcon(busIcon);
      map.panTo(busLatLng, { animate: true, duration: 0.8 });
    }
  }, [busLocation, activeBusNumber]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (busLocation && busLocation.latitude) {
      map.setView([busLocation.latitude, busLocation.longitude], 15);
    } else if (routeStops && routeStops.length > 0 && polylineRef.current) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />

      {/* Recenter / Control Floating Panel */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handleRecenter}
          className="btn btn-secondary btn-sm"
          style={{ boxShadow: 'var(--shadow-md)', background: '#ffffff' }}
          title="Recenter on Bus"
        >
          <Navigation size={14} style={{ color: 'var(--primary-yellow)' }} /> Recenter Map
        </button>
      </div>

      {/* Status Badge Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: '#ffffff',
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8125rem',
        fontWeight: '600'
      }}>
        <Radio size={16} className="animate-pulse" style={{ color: busLocation ? 'var(--success)' : 'var(--text-muted)' }} />
        <span>{busLocation ? `Tracking Active • Bus ${activeBusNumber || 'BUS-101'}` : 'Waiting for Trip Initialization'}</span>
      </div>
    </div>
  );
}
