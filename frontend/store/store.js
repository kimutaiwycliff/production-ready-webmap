import { configureStore } from '@reduxjs/toolkit';
import geoReducer from './geoSlice';

export const store = configureStore({
  reducer: {
    geo: geoReducer,
  },
});
