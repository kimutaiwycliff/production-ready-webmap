const express = require("express");
const axios = require("axios");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;
app.use(require("cors")());

// PostgreSQL Connection
const pool = new Pool({
  user: "admin",
  host: "db",
  database: "geodb",
  password: "admin",
  port: 5432,
});

// Redis Setup
const redisClient = redis.createClient({
  socket: {
    host: "redis",
    port: 6379,
  },
});

redisClient.connect().catch(console.error);

// Fetch Data from GeoServer
const fetchGeoData = async () => {
  const url = "http://geoserver:8080/geoserver/geodb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geodb:geo_data&outputFormat=application/json";
  const response = await axios.get(url);
  return response.data;
};

// API Endpoint
app.get("/api/geojson", async (req, res) => {
  try {
    const cache = await redisClient.get("geojson_data");
    if (cache) {
      console.log("Serving from Redis Cache");
      return res.json(JSON.parse(cache));
    }

    console.log("Fetching from GeoServer...");
    const geoData = await fetchGeoData();
    await redisClient.setEx("geojson_data", 300, JSON.stringify(geoData));
    res.json(geoData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
