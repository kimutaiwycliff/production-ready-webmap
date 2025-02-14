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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [activeLayer, setActiveLayer] = useState('OpenStreetMap');

  const mapRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const inputRef = useRef(null);
  const searchControlRef = useRef(null);
  const tileLayerRef = useRef(null);

  const icon = L.icon({
    iconUrl: 'globe.svg',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -30],
  });
  const provider = new OpenStreetMapProvider();
  const tileLayers = {
    OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    CartoDark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    EsriSatellite:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(
        [39.74076332773484, -96.73361614703323],
        4
      );
      // Add default tile layer
      tileLayerRef.current = L.tileLayer(tileLayers[activeLayer], {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
      setMapLoaded(true);
    }
    if (!searchControlRef.current) {
      searchControlRef.current = new GeoSearchControl({
        provider,
        style: 'bar',
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: true,
        marker: {
          icon,
        },
      });

      mapRef.current.addControl(searchControlRef.current);
    }
  }, []);
  const switchLayer = (layerKey) => {
    if (!mapRef.current || !tileLayers[layerKey]) return;

    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileLayers[layerKey], {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    setActiveLayer(layerKey);
  };

  useEffect(() => {
    if (!mapRef.current || !data) return;

    dispatch(setGeoData(data));
    setFilteredData(data);

    // Remove previous layer if it exists
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
    }

    // Create and add new GeoJSON layer
    geoJsonLayerRef.current = L.geoJSON(data, {
      style: () => ({ color: '#000', weight: 0.5 }),
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, { icon }).bindPopup(
          feature.properties?.name || 'Point'
        ),
      onEachFeature: (feature, layer) => {
        if (feature.geometry.type === 'MultiPolygon') {
          layer
            .bindPopup(
              `<strong>${feature.properties?.name || 'No Name'}</strong>`
            )
            .setStyle({
              color: feature.properties?.color || '#000',
              fillColor: feature.properties?.color || '#000',
            })
            .on('mouseover', (e) => e.target.openPopup())
            .on('mouseout', (e) => e.target.closePopup());
        }
      },
    });

    if (layersVisible) {
      geoJsonLayerRef.current.addTo(mapRef.current);
    }
  }, [data, dispatch, layersVisible]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setSelectedIndex(-1); // Reset keyboard selection

    if (!data) return;

    const filtered = data.features.filter(
      (feature) =>
        feature.properties?.name &&
        feature.properties.name.toLowerCase().includes(value)
    );

    setSearchResults(filtered);
  };

  const zoomToFeature = (feature) => {
    if (!feature.geometry?.coordinates || !mapRef.current) return;

    let targetCoordinates = null;

    if (feature.geometry.type === 'Point') {
      targetCoordinates = feature.geometry.coordinates;
    } else if (
      feature.geometry.type === 'Polygon' ||
      feature.geometry.type === 'MultiPolygon'
    ) {
      const polygonCoords = feature.geometry.coordinates[0][0];
      const sumCoords = polygonCoords.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );
      targetCoordinates = [
        sumCoords[0] / polygonCoords.length,
        sumCoords[1] / polygonCoords.length,
      ];
    }

    if (targetCoordinates) {
      const [lng, lat] = targetCoordinates;
      mapRef.current.setView([lat, lng], 8, { animate: true });
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
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchResults.length - 1)
      );
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
      zoomToFeature(searchResults[selectedIndex]);
    }
  };

  const toggleLayers = () => setLayersVisible(!layersVisible);

  return (
    <div className="relative h-screen w-full">
      {/* Loader */}
      {!mapLoaded || isLoading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}

      {/* Search Bar */}
      <div className="absolute space-y-3 top-24 left-4 z-50 p-4 bg-slate-50 bg-opacity-60 min-h-[200px] min-w-[200px] rounded-md">
        <p className="text-black font-semibold text-center">
          {isLoading
            ? 'Loading data...'
            : error
            ? `Error: ${error}`
            : 'Find Territories'}
        </p>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          )}

          {searchResults.length > 0 && (
            <ul className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-auto z-50 shadow-lg">
              {searchResults.map((feature, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer text-sm ${
                    selectedIndex === index
                      ? 'bg-gray-300'
                      : 'hover:bg-gray-200'
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

      {/* Layer Switcher */}
      <div className="absolute bottom-4 left-4 flex flex-row gap-1 p-1 rounded-lg shadow-md z-50">
        {Object.keys(tileLayers).map((key) => (
          <button
            key={key}
            onClick={() => switchLayer(key)}
            className={`px-3 py-1 text-sm rounded ${
              activeLayer === key ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Toggle Layers */}
      <div className="absolute top-4 right-4 z-50">
        <button
          className="bg-gray-800 text-white px-3 text-sm py-2 rounded-md hover:bg-gray-700"
          onClick={toggleLayers}
        >
          {layersVisible ? 'Hide' : 'Show'} layers
        </button>
      </div>

      {/* Map Container */}
      <div id="map" className="h-full w-full z-10"></div>
    </div>
  );
};

export default Map;
