import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  geoData: null,
  loading: false,
  error: null,
};

const geoSlice = createSlice({
  name: 'geo',
  initialState,
  reducers: {
    setGeoData: (state, action) => {
      state.geoData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setGeoData, setLoading, setError } = geoSlice.actions;
export default geoSlice.reducer;
