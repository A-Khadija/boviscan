import { identifyCattle as apiIdentifyCattle } from './apiService'
import { identifyCattle as localIdentifyCattle } from './localDataService'

const USE_LOCAL_DATA = false

export const identifyCattle = USE_LOCAL_DATA
  ? localIdentifyCattle
  : apiIdentifyCattle

