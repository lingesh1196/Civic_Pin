import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const STATUS_PIN_COLORS = {
  Open: '#D97706',
  'In Progress': '#2563EB',
  Resolved: '#2D6A4F',
  Rejected: '#9F1239',
};

export default function IssueMap({
  issues,
  onSelectIssue,
  highlightedId = null,
  height = 'calc(100vh - 13rem)',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const markersByIdRef = useRef({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView([13.04, 80.24], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!layerGroupRef.current || !mapRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();
    markersByIdRef.current = {};

    const bounds = [];
    issues.forEach((issue) => {
      const lat = issue.location?.lat;
      const lng = issue.location?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      bounds.push([lat, lng]);
      const color = STATUS_PIN_COLORS[issue.status] || '#57534E';

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: color,
        color: '#FFFDF9',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95,
      });

      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '210px';
      popupEl.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:${color};margin-bottom:3px;">${issue.category} · ${issue.status}</div>
        <div style="font-size:13px;font-weight:700;color:#18181B;margin-bottom:4px;line-height:1.3;">${issue.title}</div>
        <div style="font-size:11px;color:#57534E;margin-bottom:10px;">${issue.location?.address || ''}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:#C84B31;">▲ ${issue.upvotes?.length || 0} votes</span>
          <button type="button" data-open-issue="${issue._id}" style="font-size:11px;font-weight:600;color:#FFFDF9;background:#18181B;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;">Open log</button>
        </div>
      `;

      popupEl.querySelector('[data-open-issue]')?.addEventListener('click', () => {
        onSelectIssue(issue);
      });

      marker.bindPopup(popupEl);
      marker.addTo(group);
      markersByIdRef.current[issue._id] = { marker, color };
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    }
  }, [issues, onSelectIssue]);

  useEffect(() => {
    Object.entries(markersByIdRef.current).forEach(([id, { marker, color }]) => {
      const active = id === highlightedId;
      marker.setStyle({
        radius: active ? 13 : 9,
        fillColor: active ? '#C84B31' : color,
        weight: active ? 3.5 : 2.5,
      });
      if (active) {
        marker.bringToFront();
      }
    });
  }, [highlightedId]);

  return (
    <div className="bg-white rounded-xl border border-[#E4DFD3] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#FAF8F4] border-b border-[#E4DFD3] flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
        <span className="font-mono-code text-[11px] uppercase tracking-wider text-[#18181B] font-medium">
          Live Pin Map ({issues.length})
        </span>
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_PIN_COLORS).map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div ref={containerRef} style={{ height, minHeight: '420px', width: '100%' }} />
    </div>
  );
}
