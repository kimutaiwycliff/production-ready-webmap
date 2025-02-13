'use client';

import { setGeoData } from "@/store/geoSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const fetchGeoData = async () => {
  try {
    const { data } = await axios.get("/api/geojson", {
      timeout: 5000, // Set a timeout to avoid hanging requests
    });
    return data;
  } catch (error) {
    console.error("Error fetching geo data:", error.message);
    return null;
  }
};


export const useGeoData = () => {
  const dispatch = useDispatch();
  const geoData = useSelector((state) => state.geo.geoData);

  const { data, error, isLoading } = useQuery({
    queryKey: ["geojson"],
    queryFn: fetchGeoData,
    onSuccess: (fetchedData) => {
      dispatch(setGeoData(fetchedData));  // Save in Redux store
    },
  });

  return { data: geoData || data, error, isLoading };
};
