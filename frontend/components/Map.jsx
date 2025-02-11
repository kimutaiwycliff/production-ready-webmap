
'use client'
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchData } from '@/lib/actions';

const Map = () => {
  const [layersVisible, setLayersVisible] = useState(true);
  const data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [36.88112302280874, -1.2983702370082568],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [37.24287284384917, -1.2673708818882687],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [37.26974568769745, -0.8354119995914289],
          type: 'Point',
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [36.856317320793835, -0.5377652822287047],
            [37.377237063092366, -0.5129606231860748],
            [37.61909265773173, -0.32278871964662414],
            [38.25163805909338, -0.33519136616746437],
          ],
          type: 'LineString',
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [37.60462266488955, -0.6865909571607745],
              [37.46405702014192, -0.9697595164779216],
              [37.60668980672429, -1.2777040419384207],
              [37.970506769599524, -1.3025034558356055],
              [38.119340981684985, -0.9924947428000195],
              [38.03252102463543, -0.7051938613928286],
              [37.60462266488955, -0.6865909571607745],
            ],
          ],
          type: 'Polygon',
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [37.28834996420801, -1.5918106986415383],
              [37.27902988024734, -1.5922683665310517],
              [37.26979954122532, -1.5936369632140517],
              [37.260747828247446, -1.5959033101540057],
              [37.25196190305652, -1.5990455841158178],
              [37.243526369030455, -1.6030335272309633],
              [37.235522456773374, -1.6078287382556338],
              [37.228027242129876, -1.6133850422214995],
              [37.22111290414215, -1.6196489349248593],
              [37.21484603008689, -1.626560097980239],
              [37.20928697427797, -1.6340519794857253],
              [37.20448927680603, -1.6420524347160927],
              [37.200499147811605, -1.650484420682044],
              [37.19735502226094, -1.6592667378752253],
              [37.195087189517544, -1.6683148120640579],
              [37.19371750128581, -1.6775415086191812],
              [37.193259160751126, -1.6868579715331917],
              [37.19371659496181, -1.6961744790603592],
              [37.195085411698926, -1.705401307740507],
              [37.19735244126802, -1.7144495964887696],
              [37.20049586283016, -1.7232322024304332],
              [37.204485414075684, -1.731664540237528],
              [37.209282682240946, -1.7396653968806948],
              [37.214841473683514, -1.747157713944612],
              [37.22110825847231, -1.7540693299658174],
              [37.228022685724056, -1.7603336756351864],
              [37.23551816473183, -1.7658904151600032],
              [37.24352250629419, -1.7706860275982519],
              [37.25195861806867, -1.774674322555459],
              [37.26074524724861, -1.7778168852666711],
              [37.26979776340217, -1.780083446766834],
              [37.27902897392089, -1.7814521755753783],
              [37.28834996420801, -1.781909888078232],
              [37.29767095449513, -1.7814521755753783],
              [37.306902165013845, -1.780083446766834],
              [37.315954681167405, -1.7778168852666711],
              [37.32474131034735, -1.774674322555459],
              [37.33317742212182, -1.7706860275982519],
              [37.34118176368418, -1.7658904151600032],
              [37.34867724269196, -1.7603336756351864],
              [37.355591669943706, -1.7540693299658177],
              [37.361858454732506, -1.747157713944612],
              [37.367417246175066, -1.7396653968806948],
              [37.37221451434033, -1.731664540237528],
              [37.37620406558586, -1.7232322024304332],
              [37.379347487147996, -1.7144495964887696],
              [37.381614516717086, -1.705401307740507],
              [37.382983333454206, -1.6961744790603592],
              [37.383440767664894, -1.6868579715331917],
              [37.3829824271302, -1.6775415086191814],
              [37.38161273889847, -1.6683148120640579],
              [37.379344906155076, -1.6592667378752253],
              [37.37620078060441, -1.650484420682044],
              [37.37221065160999, -1.6420524347160927],
              [37.36741295413805, -1.6340519794857253],
              [37.36185389832913, -1.626560097980239],
              [37.35558702427386, -1.6196489349248595],
              [37.348672686286136, -1.6133850422214995],
              [37.34117747164264, -1.6078287382556338],
              [37.33317355938556, -1.6030335272309633],
              [37.324738025359494, -1.5990455841158178],
              [37.315952100168566, -1.5959033101540057],
              [37.3069003871907, -1.5936369632140517],
              [37.297670048168676, -1.5922683665310517],
              [37.28834996420801, -1.5918106986415383],
            ],
          ],
        },
      },
    ],
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const territories = await fetchData();
      setFilteredData(territories);
    };

    fetchDataAndSetState();
  }, []);
  const icon = L.icon({
    iconUrl: 'globe.svg',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -30],
  });
  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView(
      [-1.2983702370082568, 36.88112302280874],
      8
    );
    const initialBounds = map.getBounds();
    // Add OpenStreetMap tiles
    const osmTiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    osmTiles.addTo(map);
    // // Initialize the OpenStreetMap provider
    // const provider = new OpenStreetMapProvider();

    // // Create the search control
    // // @ts-ignore
    // const searchControl = new GeoSearchControl({
    //   provider: provider, // Set provider
    //   style: 'button', // Optional: 'bar' or 'button'
    //   showMarker: true, // Show a marker on search
    //   marker: {
    //     draggable: false, // Allow dragging the marker
    //   },
    //   autoClose: false, // Close results after selection
    //   retainZoomLevel: false, // Maintain zoom level after search
    // });

    // // Add search control to the map
    // map.addControl(searchControl);

    const geoJson = L.geoJSON(filteredData, {
      style: (feature) => {
        console.log(feature);
        return { color: '#000', weight: 0.5 };
      },
      pointToLayer: (feature, latlng) => {
        console.log(feature);

        return L.marker(latlng, { icon }).bindPopup('I am a point');
      },
      onEachFeature: (feature, layer) => {
        if (feature.geometry.type === 'MultiPolygon') {
          layer
            .bindPopup(`${feature.properties.Name}`)
            .setStyle({
              color: `${feature.properties.color}`,
              fillColor: `${feature.properties.color}`,
            })
            .on('mouseover', (e) => {
              e.target.openPopup();
              e.target.setStyle({
                color: `${feature.properties.color}`,
                fillColor: `${feature.properties.color}`,
              });
            })
            .on('mouseout', (e) => {
              e.target.closePopup();
              e.target.setStyle({ color: '#000', fillColor: '#000' });
            });
        }
      },
    });

    if (layersVisible) {
      geoJson.addTo(map);
    }

    const bounds = geoJson.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(initialBounds);
    } else {
      map.fitBounds(initialBounds);
    }
    // Clean up map instance on component unmount
    return () => {
      map.remove();
    };
  }, [filteredData, layersVisible]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = {
      ...data,
      features: data.features.filter((feature) =>
        feature.geometry.type.toLowerCase().includes(value)
      ),
    };

    setFilteredData(filtered);
  };

  const toggleLayers = () => {
    setLayersVisible(!layersVisible);
  };

  return (
    <div className="relative h-screen w-full">
      <div className="absolute  space-y-3 bottom-6 right-2 z-30 p-4 bg-slate-50 bg-opacity-60 min-h-[200px] min-w-[200px] rounded-lg border">
        <p className="text-black font-bold underline-offset-auto text-center">
          Map of Nairobi
        </p>

        <button
          className=" flex justify-items-end bg-slate-800 text-white hover:bg-slate-600"
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
