'use server';

import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin',
  host: 'postgres', // Service name from docker-compose
  database: 'geodb',
  password: 'admin',
  port: 5432,
});

export async function GET() {
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

    return Response.json(formattedData);
  } catch (error) {
    console.error('❌ PostgreSQL Query Error:', error.message);
    return Response.json(
      { error: 'Failed to fetch data from PostgreSQL' },
      { status: 500 }
    );
  }
}
