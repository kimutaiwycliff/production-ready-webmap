'use server';

import axios from 'axios';
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis', // Service name from docker-compose
  port: 6379,
});
/**
 * Fetch GeoData from GeoServer with optional BBOX filtering.
 * @param {string} bbox - Bounding box in "minx,miny,maxx,maxy" format.
 */
const fetchGeoData = async (bbox) => {
  try {
    let url =
      'http://geoserver:8080/geoserver/GeoData/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GeoData:territories&outputFormat=application/json';

    // If BBOX is provided, add it to the URL
    if (bbox) {
      url += `&bbox=${bbox},EPSG:4326`; // Adjust to your projection
    }

    const response = await axios.get(url);
    console.log('✅ Data fetched from GeoServer.');
    return response.data;
  } catch (error) {
    console.error('❌ GeoServer Fetch Error:', error.message);
    throw new Error('Failed to fetch GeoData.');
  }
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bbox = searchParams.get('bbox'); // Get BBOX from query params

    // Check Redis Cache
    const cacheKey = bbox ? `geojson_data_${bbox}` : 'geojson_data_all';
    const cache = await redis.get(cacheKey);

    if (cache) {
      console.log(`📌 Serving GeoJSON from Redis Cache (${bbox || "full"})`);
      return Response.json(JSON.parse(cache));
    }

    // Fetch new data from GeoServer
    console.log(`🌍 Fetching new GeoJSON from GeoServer (${bbox || "full"})...`);
    const geoData = await fetchGeoData(bbox);

    // Cache response for 5 minutes
    await redis.set(cacheKey, JSON.stringify(geoData), 'EX', 300);

    return Response.json(geoData);
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
