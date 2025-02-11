'use client';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeoData } from '@/hooks/useGeoData';
import { useDispatch } from 'react-redux';
import { setGeoData } from '@/store/geoSlice';

const Map = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGeoData();

  const [layersVisible, setLayersVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const mapRef = useRef(null); // Store map instance

  useEffect(() => {
    if (data) {
      dispatch(setGeoData(data)); // Save to Redux
      setFilteredData(data);
    }
  }, [data, dispatch]);

  const icon = L.icon({
    iconUrl: 'globe.svg',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -30],
  });

  useEffect(() => {
    if (!filteredData) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(
        [-1.2983702370082568, 36.88112302280874], // Default center
        12
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const geoJsonLayer = L.geoJSON(filteredData, {
      style: (feature) => ({ color: '#000', weight: 0.5 }),
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, { icon }).bindPopup(feature.properties?.name || 'Point'),
      onEachFeature: (feature, layer) => {
        if (feature.geometry.type === 'MultiPolygon') {
          layer
            .bindPopup(feature.properties?.name || 'No Name')
            .setStyle({
              color: feature.properties?.color || '#000',
              fillColor: feature.properties?.color || '#000',
            })
            .on('mouseover', (e) => e.target.openPopup())
            .on('mouseout', (e) =>
              e.target
                .closePopup()
                .setStyle({ color: '#000', fillColor: '#000' })
            );
        }
      },
    });

    if (layersVisible) geoJsonLayer.addTo(map);

    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });
    };
  }, [filteredData, layersVisible]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (!data) return; // Ensure data exists

    // Filter features by name
    const filtered = {
      ...data,
      features: data.features.filter(
        (feature) =>
          feature.properties?.name &&
          feature.properties.name.toLowerCase().includes(value)
      ),
    };

    setFilteredData(filtered);

    // Fly to the first matching feature
    if (filtered.features.length > 0) {
      const firstFeature = filtered.features[0];

      if (firstFeature.geometry?.coordinates) {
        let targetCoordinates = null;

        if (firstFeature.geometry.type === 'Point') {
          // Extract point coordinates directly
          targetCoordinates = firstFeature.geometry.coordinates;
        } else if (firstFeature.geometry.type === 'Polygon' || firstFeature.geometry.type === 'MultiPolygon') {
          // Extract the centroid of the polygon (average of first ring)
          const polygonCoords = firstFeature.geometry.coordinates[0][0]; // Get first ring
          const sumCoords = polygonCoords.reduce(
            (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
            [0, 0]
          );
          const centroid = [sumCoords[0] / polygonCoords.length, sumCoords[1] / polygonCoords.length];
          targetCoordinates = centroid;
        }

        if (targetCoordinates) {
          const [lng, lat] = targetCoordinates; // Ensure correct order
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 12, { animate: true });
          }
        }
      }
    }
  };


  const toggleLayers = () => setLayersVisible(!layersVisible);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute space-y-3 bottom-6 right-2 z-30 p-4 bg-slate-50 bg-opacity-60 min-h-[200px] min-w-[200px] rounded-lg border">
        <p className="text-black font-bold text-center">
          {isLoading
            ? 'Loading map data...'
            : error
            ? `Error fetching data: ${error}`
            : 'Map Data'}
        </p>
        <button
          className="flex justify-items-end bg-slate-800 text-white hover:bg-slate-600 px-3 py-1 rounded"
          onClick={toggleLayers}
        >
          {layersVisible ? 'Hide' : 'Show'} layers
        </button>
        <input
          type="text"
          placeholder="Search Territory"
          value={searchTerm}
          onChange={handleSearch}
          className="text-black font-light text-sm w-full px-2 py-1 rounded border"
        />
      </div>
      <div id="map" className="h-full w-full z-10"></div>
    </div>
  );
};

export default Map;
