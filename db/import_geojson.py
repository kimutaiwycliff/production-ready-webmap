import json
import psycopg2
import time
from shapely.geometry import shape

#Database credentials
DB_NAME = "geodb"
DB_USER = "admin"
DB_PASSWORD = "admin"
DB_HOST = "postgres"

# Wait for the database to be ready
for i in range(10):
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST)
        print("✅ Connected to PostgreSQL successfully!")
        break
    except psycopg2.OperationalError:
        print(f"⏳ PostgreSQL not ready yet ({i+1}/10) ... rettrying in 5 seconds")
        time.sleep(5)
else:
    raise Exception("❌ Failed to connect to PostgreSQL after 10 attempts")

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
