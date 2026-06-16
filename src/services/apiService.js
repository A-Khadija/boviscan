const API_BASE = 'https://khadijaasehnoune12-cattle-biometrics-api.hf.space/gradio_api'

// MongoDB API endpoint - user should configure this
// Example: 'https://your-mongodb-api.com/api/cattle'
const MONGODB_API_BASE = import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:5002/api'

// Import local JSON data for fallback enrichment
import identificationsData from '../data/identifications.json'
import lactationsData from '../data/lactations.json'

/**
 * Extract the last 4 digits from API cow ID and find full NNI in MongoDB
 * API returns something like "BOVIN 1670" or just "1670"
 */
function extractLastDigits(cowId) {
  const match = String(cowId).match(/(\d{4,})$/)
  return match ? match[1].slice(-4) : null
}

function normalizeCowId(cowId) {
  return String(cowId || '')
    .replace(/^BOVIN\s*/i, '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase()
}

/**
 * ALWAYS uses local JSON files to find full cow data and lactations
 * This is used for data ENRICHMENT regardless of API_ONLY setting
 */
function findCowInLocalData(partialId) {
  const normalized = normalizeCowId(partialId)
  if (!normalized) return null

  // Try exact match first
  const exactMatch = identificationsData.find(
    record => record.nni && normalizeCowId(record.nni) === normalized
  )
  if (exactMatch) return { ...exactMatch }

  // Try last 4 digits match
  const last4 = normalized.slice(-4)
  if (!last4) return null

  const byLastDigits = identificationsData.find(record =>
    record.nni && normalizeCowId(record.nni).endsWith(last4)
  )
  
  return byLastDigits ? { ...byLastDigits } : null
}

/**
 * ALWAYS uses local JSON files to get lactations
 */
function getLactationsFromLocal(nni) {
  const normalized = normalizeCowId(nni)
  if (!normalized) return []

  return lactationsData
    .filter(record => record.nni && normalizeCowId(record.nni) === normalized)
    .sort((a, b) => (a.numlact || 1) - (b.numlact || 1))
}

async function fetchCowByExactId(nni) {
  const response = await fetch(
    `${MONGODB_API_BASE}/cattle/search?nni=${encodeURIComponent(nni)}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('API error')
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data[0] || null
  }

  return data || null
}

/**
 * Find full cow data from MongoDB using last 4 digits of NNI
 */
export async function findCowByPartialId(partialId) {
  try {
    const nni = normalizeCowId(partialId)

    if (nni) {
      try {
        const exactMatch = await fetchCowByExactId(nni)
        if (exactMatch) return exactMatch
      } catch (err) {
        console.warn('Exact MongoDB fetch failed:', err)
      }
    }

    const last4 = extractLastDigits(nni)
    if (!last4) return null

    const response = await fetch(
      `${MONGODB_API_BASE}/cattle/search?nniEndsWith=${encodeURIComponent(last4)}`
    )

    // ✅ 404 = cow not found (normal case)
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error('API error')
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data[0] || null
    }

    return data
  } catch (err) {
    console.warn('MongoDB fetch failed:', err)
    return null
  }
}
/**
 * Get lactations for a cow by NNI
 */
export async function getLactationsByNNI(nni) {
  try {
    const response = await fetch(
      `${MONGODB_API_BASE}/lactations?nni=${encodeURIComponent(nni)}`
    )

    if (!response.ok) return []

    return await response.json()
  } catch (err) {
    console.warn('Lactations fetch failed:', err)
    return []
  }
}

/**
 * Upload image to HF Gradio API
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('files', file)

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upload failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (Array.isArray(data) && data.length > 0) {
    return data[0]
  }

  if (typeof data === 'string') {
    return data
  }

  throw new Error('Unexpected upload response format')
}

/**
 * Send predict request to get event_id
 */
export async function sendPredictRequest(filePath) {
  const payload = {
    img: {
      path: filePath,
      meta: { _type: 'gradio.FileData' }
    }
  }

  const response = await fetch(`${API_BASE}/call/v2/identify_cattle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Predict request failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (!data.event_id) {
    throw new Error('No event_id received from predict endpoint')
  }

  return data.event_id
}

export async function pollResult(eventId, onStatusUpdate = () => {}) {
  const url = `${API_BASE}/call/identify_cattle/${eventId}`

  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          continue
        }

        const errorText = await response.text()
        throw new Error(`Result fetch failed: ${response.status} - ${errorText}`)
      }

      const text = await response.text()
      const lines = text.split('\n')

      let eventType = null
      let dataLine = null

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.replace('event:', '').trim()
        }
        if (line.startsWith('data:')) {
          dataLine = line.replace('data:', '').trim()
        }
      }

      if (eventType === 'complete' && dataLine) {
        return JSON.parse(dataLine)
      }

      if (eventType === 'error') {
        throw new Error(dataLine || 'Prediction error')
      }

      onStatusUpdate(eventType || 'processing')
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (err) {
      if (attempt === 29) throw err
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }

  throw new Error('Polling timeout')
}

/**
 * Search for cow by NNI or partial ID (last 4 digits)
 * Uses LOCAL JSON files for data enrichment
 */
export async function searchCowByNNI(nni) {
  try {
    const normalizedNni = normalizeCowId(nni)
    
    if (!normalizedNni) {
      throw new Error('Invalid NNI')
    }

    // Use local data to find the cow
    const cowData = findCowInLocalData(normalizedNni)
    
    if (!cowData) {
      throw new Error(`No cattle found with NNI: ${nni}`)
    }

    // Get lactations from local data
    if (cowData.nni) {
      const lactations = getLactationsFromLocal(cowData.nni)
      cowData.lactations = lactations
    }

    return cowData
  } catch (err) {
    console.warn('Search failed:', err)
    throw err
  }
}

/**
 * Complete flow: upload -> predict -> poll result -> fetch MongoDB data
 */
export async function identifyCattle(file, onProgress = () => {}) {
  // Step 1: Upload
  onProgress({ step: 'upload', status: 'uploading', message: 'uploading' })
  const filePath = await uploadImage(file)
  onProgress({ step: 'upload', status: 'complete', message: 'complete' })

  // Step 2: Send predict request
  onProgress({ step: 'predict', status: 'processing', message: 'sending' })
  const eventId = await sendPredictRequest(filePath)
  onProgress({ step: 'predict', status: 'complete', message: 'complete' })

  // Step 3: Poll for result
  onProgress({ step: 'result', status: 'polling', message: 'analyzing' })

  const apiResult = await pollResult(eventId, (status) => {
    onProgress({ step: 'result', status: 'polling', message: status })
  })

  onProgress({ step: 'result', status: 'complete', message: 'complete' })

  // Step 4: Parse result and fetch MongoDB data
  const [debugImage, statusText, rawCowId, confidenceText, faissDetails] = apiResult
  const cowId = normalizeCowId(rawCowId)

  const confidenceMatch = confidenceText?.match(/([\d.]+)/)
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0

  const isFound = statusText?.toLowerCase().includes('trouvé') || 
                  statusText?.toLowerCase().includes('found') ||
                  confidence > 50

  // Step 5: Always try to fetch data from LOCAL JSON files for enrichment
  let dbData = null
  if (cowId) {
    try {
      onProgress({ step: 'database', status: 'loading', message: 'loading' })
      
      // Always use local JSON data to find full NNI and enrichment
      dbData = findCowInLocalData(cowId)

      if (dbData && dbData.nni) {
        // Fetch lactations from local data
        const lactations = getLactationsFromLocal(dbData.nni)
        dbData.lactations = lactations
      }
      
      onProgress({ step: 'database', status: 'complete', message: 'complete' })
    } catch (err) {
      console.warn('Local data fetch failed:', err)
      onProgress({ step: 'database', status: 'error', message: 'error' })
      // Continue even if database fetch fails
    }
  }

  return {
    apiResult,
    parsed: {
      statusText,
      cowId,
      confidence,
      confidenceText,
      isFound,
      fullNni: dbData?.nni || cowId  // Return full NNI if found
    },
    dbData
  }
}
