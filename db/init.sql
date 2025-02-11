CREATE EXTENSION postgis;

CREATE TABLE geo_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(Polygon, 4326)
);
