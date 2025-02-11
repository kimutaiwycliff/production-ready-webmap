'use client';
import { useEffect, useState } from 'react';
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

    const map = L.map('map').setView(
      [-1.2983702370082568, 36.88112302280874],
      12
    );
    // const initialBounds = map.getBounds();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const geoJson = L.geoJSON(filteredData, {
      style: (feature) => ({ color: '#000', weight: 0.5 }),
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, { icon }).bindPopup('I am a point'),
      onEachFeature: (feature, layer) => {
        if (feature.geometry.type === 'MultiPolygon') {
          layer
            .bindPopup(`${feature.properties.name}`)
            .setStyle({
              color: feature.properties.color,
              fillColor: feature.properties.color,
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

    if (layersVisible) geoJson.addTo(map);

    // const bounds = geoJson.getBounds();
    // if (bounds.isValid()) map.fitBounds(bounds);
    // else map.fitBounds(initialBounds);

    return () => map.remove();
  }, [filteredData, layersVisible]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (!data) return;

    const filtered = {
      ...data,
      features: data.features.filter((feature) =>
        feature.geometry.type.toLowerCase().includes(value)
      ),
    };

    setFilteredData(filtered);
  };

  const toggleLayers = () => setLayersVisible(!layersVisible);
  return (
    <div className="relative h-screen w-full">
      <div className="absolute space-y-3 bottom-6 right-2 z-30 p-4 bg-slate-50 bg-opacity-60 min-h-[200px] min-w-[200px] rounded-lg border">
        <p className="text-black font-bold text-center">
          {isLoading
            ? 'Loading map data...'
            : error
            ? `Error fetching data:, ${error}`
            : 'Map Data'}
        </p>
        <button
          className="flex justify-items-end bg-slate-800 text-white hover:bg-slate-600"
          onClick={toggleLayers}
        >
          {layersVisible ? 'Hide' : 'Show'} layers
        </button>
        <input
          type="text"
          placeholder="Search by geometry type (Point, LineString, Polygon)"
          value={searchTerm}
          onChange={handleSearch}
          className="text-black font-light text-sm"
        />
      </div>
      <div id="map" className="h-full w-full z-10"></div>
    </div>
  );
};

export default Map;
