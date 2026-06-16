import { identifyCattle as apiIdentifyCattle } from './apiService'
import { identifyCattle as localIdentifyCattle } from './localDataService'
import { searchCowByNNI as apiSearchCowByNNI } from './apiService'
import { searchCowByNNI as localSearchCowByNNI } from './localDataService'

// TEMPORARY: Always use local mock data because the backend is currently offline.
// To revert to backend: change this to `false` or remove this override.
const USE_LOCAL_DATA = false

// ============================================================
// Data service abstraction layer
//
// Switch between local JSON mock data and the real backend API.
//
// To use local mock data: set USE_LOCAL_DATA = true below
// To use the real backend: set USE_LOCAL_DATA = false
//
// Reverting is simple: just flip USE_LOCAL_DATA to false.
// All downstream imports in App.jsx use './services/dataService'
// ============================================================

export const identifyCattle = USE_LOCAL_DATA
  ? localIdentifyCattle
  : apiIdentifyCattle

export const searchCowByNNI = USE_LOCAL_DATA
  ? localSearchCowByNNI
  : apiSearchCowByNNI
