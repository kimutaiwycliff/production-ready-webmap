'use client';

import { setGeoData } from "@/store/geoSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const fetchGeoData = async (bbox) => {
  if (!bbox) return null; // Prevent unnecessary API calls
  try {
    const { data } = await axios.get(`/api/geojson?bbox=${bbox}`);
    return data;
  } catch (error) {
    console.error("Error fetching geo data:", error.message);
    return null;
  }
};


export const useGeoData = (map) => {
  const dispatch = useDispatch();
  const geoData = useSelector((state) => state.geo.geoData);
  const [bounds, setBounds] = useState(null);

  // Debounced function to update map bounds
  const updateBounds = useCallback(
    debounce(() => {
      if (!map || !map.getBounds) return;
      const { _southWest, _northEast } = map.getBounds();
      const bbox = `${_southWest.lng},${_southWest.lat},${_northEast.lng},${_northEast.lat}`;
      setBounds(bbox);
    }, 500),
    [map]
  );

  // Fetch initial bounds when map is ready
  useEffect(() => {
    if (map && map.getBounds) {
      updateBounds();
    }
  }, [map, updateBounds]);

  // Listen for map movements
  useEffect(() => {
    if (!map || !map.on) return;
    map.on("moveend", updateBounds);
    return () => map.off("moveend", updateBounds);
  }, [map, updateBounds]);

  // Fetch data using React Query
  const { data, error, isLoading } = useQuery({
    queryKey: ["geojson", bounds],
    queryFn: () => fetchGeoData(bounds),
    enabled: !!bounds, // Fetch only if bounds exist
    onSuccess: (fetchedData) => {
      if (fetchedData) dispatch(setGeoData(fetchedData));
    },
  });

  return { data: data ?? geoData, error, isLoading };
};
