import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  geoData: null,  
};

const geoSlice = createSlice({
  name: "geo",
  initialState,
  reducers: {
    setGeoData: (state, action) => {
      state.geoData = action.payload;
    },
  },
});

export const { setGeoData } = geoSlice.actions;
export default geoSlice.reducer;
