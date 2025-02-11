const express = require('express');
const axios = require('axios');
const redis = require('redis');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 5001;
app.use(cors());

// PostgreSQL Connection
const pool = new Pool({
  user: 'admin',
  host: 'postgres', // Use the service name from docker-compose
  database: 'geodb',
  password: 'admin',
  port: 5432,
});

// Redis Setup
const redisClient = redis.createClient({
  socket: {
    host: 'redis', // Use the Redis service name from docker-compose
    port: 6379,
  },
});

redisClient
  .connect()
  .catch((err) => console.error('Redis Connection Error:', err));

// Fetch Data from GeoServer
const fetchGeoData = async () => {
  try {
    const url =
      'http://geoserver:8080/geoserver/GeoData/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GeoData:territories&outputFormat=application/json';
    const response = await axios.get(url);
    console.log('Data fetched from GeoServer successfully.');
    return response.data;
  } catch (error) {
    console.error('Error fetching GeoData:', error.message);
    throw new Error('Failed to fetch data from GeoServer.');
  }
};

// API Endpoint to Fetch GeoJSON
app.get('/api/geojson', async (req, res) => {
  try {
    // Check Redis cache first
    const cache = await redisClient.get('geojson_data');
    if (cache) {
      console.log('Serving GeoJSON from Redis Cache');
      return res.json(JSON.parse(cache));
    }

    // Fetch from GeoServer if cache is empty
    console.log('Fetching GeoJSON from GeoServer...');
    const geoData = await fetchGeoData();

    // Cache response in Redis for 5 minutes
    await redisClient.setEx('geojson_data', 300, JSON.stringify(geoData));

    res.json(geoData);
  } catch (error) {
    console.error('Error in /api/geojson:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API Endpoint to Fetch Data from PostgreSQL
app.get('/api/pgdata', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, ST_AsGeoJSON(geom) AS geom FROM geo_data'
    );
    const formattedData = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        geometry: JSON.parse(row.geom),
        properties: { id: row.id, name: row.name },
      })),
    };
    res.json(formattedData);
  } catch (error) {
    console.error('PostgreSQL Query Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from PostgreSQL' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
