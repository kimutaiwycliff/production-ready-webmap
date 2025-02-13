'use server';

import axios from 'axios';
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis', // Service name from docker-compose
  port: 6379,
});

const fetchGeoData = async () => {
  try {
    const url =
      'http://geoserver:8080/geoserver/GeoData/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GeoData:territories&outputFormat=application/json';

    const response = await axios.get(url);
    console.log('✅ Data fetched from GeoServer.');
    return response.data;
  } catch (error) {
    console.error('❌ GeoServer Fetch Error:', error.message);
    throw new Error('Failed to fetch GeoData.');
  }
};

export async function GET() {
  try {
    // Check Redis Cache
    const cache = await redis.get('geojson_data');
    if (cache) {
      console.log('📌 Serving GeoJSON from Redis Cache');
      return Response.json(JSON.parse(cache));
    }

    // Fetch new data from GeoServer
    console.log('🌍 Fetching new GeoJSON from GeoServer...');
    const geoData = await fetchGeoData();

    // Cache response for 5 minutes
    await redis.set('geojson_data', JSON.stringify(geoData), 'EX', 300);

    return Response.json(geoData);
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
