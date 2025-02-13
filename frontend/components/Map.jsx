'use client';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeoData } from '@/hooks/useGeoData';
import { useDispatch } from 'react-redux';
import { setGeoData } from '@/store/geoSlice';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const Map = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGeoData();

  const [layersVisible, setLayersVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // Track keyboard selection
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (data) {
      dispatch(setGeoData(data));
    }
  }, [data, dispatch]);

  const icon = L.icon({
    iconUrl: 'globe.svg',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -30],
  });

  useEffect(() => {
    if (!data) return;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([-1.2983702370082568, 36.88112302280874], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        showMarker: true,
        showPopup: true,
        marker: { icon },
      });

      mapRef.current.addControl(searchControl);
    }

    const geoJsonLayer = L.geoJSON(data, {
      style: () => ({ color: '#000', weight: 0.5 }),
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, { icon }).bindPopup(feature.properties?.name || 'Point'),
      onEachFeature: (feature, layer) => {
        if (feature.geometry.type === 'MultiPolygon') {
          layer
            .bindPopup(feature.properties?.name || 'No Name')
            .setStyle({ color: feature.properties?.color || '#000', fillColor: feature.properties?.color || '#000' })
            .on('mouseover', (e) => e.target.openPopup())
            .on('mouseout', (e) => e.target.closePopup().setStyle({ color: '#000', fillColor: '#000' }));
        }
      },
    });

    if (layersVisible) geoJsonLayer.addTo(mapRef.current);

    return () => {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          mapRef.current.removeLayer(layer);
        }
      });
    };
  }, [data, layersVisible]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setSelectedIndex(-1); // Reset keyboard selection

    if (!data) return;

    const filtered = data.features.filter(
      (feature) => feature.properties?.name && feature.properties.name.toLowerCase().includes(value)
    );

    setSearchResults(filtered);
  };

  const zoomToFeature = (feature) => {
    if (!feature.geometry?.coordinates || !mapRef.current) return;

    let targetCoordinates = null;

    if (feature.geometry.type === 'Point') {
      targetCoordinates = feature.geometry.coordinates;
    } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      const polygonCoords = feature.geometry.coordinates[0][0];
      const sumCoords = polygonCoords.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );
      targetCoordinates = [sumCoords[0] / polygonCoords.length, sumCoords[1] / polygonCoords.length];
    }

    if (targetCoordinates) {
      const [lng, lat] = targetCoordinates;
      mapRef.current.setView([lat, lng], 12, { animate: true });
    }

    setSearchResults([]); // Clear the suggestions list but keep the input text
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (searchResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, searchResults.length - 1));
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
      zoomToFeature(searchResults[selectedIndex]);
    }
  };

  const toggleLayers = () => setLayersVisible(!layersVisible);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute space-y-3 bottom-6 right-2 z-30 p-4 bg-slate-50 bg-opacity-60 min-h-[200px] min-w-[200px] rounded-lg border">
        <p className="text-black font-bold text-center">
          {isLoading ? 'Loading map data...' : error ? `Error fetching data: ${error}` : 'Map Data'}
        </p>
        <button
          className="flex justify-items-end bg-slate-800 text-white hover:bg-slate-600 px-3 py-1 rounded"
          onClick={toggleLayers}
        >
          {layersVisible ? 'Hide' : 'Show'} layers
        </button>
        <div className="relative">
          <div className="flex items-center border rounded px-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Territory"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className="text-black font-light text-sm w-full py-1 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="text-gray-500 hover:text-black ml-2">
                ✕
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <ul className="absolute bg-white border rounded w-full mt-1 max-h-30 overflow-auto z-50 shadow-lg">
              {searchResults.map((feature, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${
                    selectedIndex === index ? 'bg-gray-300' : 'hover:bg-gray-200'
                  }`}
                  onClick={() => zoomToFeature(feature)}
                >
                  {feature.properties.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div id="map" className="h-full w-full z-10"></div>
    </div>
  );
};

export default Map;
