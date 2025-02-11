import axios from 'axios';

export const fetchData = async () => {
  try {
    const response = await axios.get(
      `https://native-land.ca/api/polygons/geojson/territories?key=TwMI9ZMa_ZlPKlLpKAlqg`
    );
    console.log('data', response?.data);

    return response?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
