import json
import psycopg2
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

# Database connection
conn = psycopg2.connect(dbname="geodb", user="admin", password="admin", host="postgres")
cursor = conn.cursor()

# Read GeoJSON file
with open("territories.geojson") as f:
    data = json.load(f)

# Insert into PostgreSQL
for feature in data["features"]:
    geom = shape(feature["geometry"])
    name = feature["properties"].get("Name", "Unknown")
    color = feature["properties"].get("color", "#000000")
    description = feature["properties"].get("description", "")

    cursor.execute(
        "INSERT INTO geo_data (name, color, description,geom) VALUES (%s, %s,%s,ST_GeomFromText(%s, 4326))",
        (name, color, description, geom.wkt),
    )

conn.commit()
cursor.close()
conn.close()

print("✅ GeoJSON imported successfully!")
