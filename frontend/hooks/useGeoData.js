import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchGeoData = async () => {
  const { data } = await axios.get(
    'http://localhost:8080/geoserver/geodb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geodb:geospatial_data&outputFormat=application/json'
  );
  return data;
};

export default function useGeospatial() {
  return useQuery({
    queryKey: ['geoData'],
    queryFn: fetchGeoData,
  });
}
