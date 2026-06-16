import identificationsData from '../data/identifications.json'
import lactationsData from '../data/lactations.json'

const PARENT_KEYS = ['mere', 'pere', 'gpm', 'gmm', 'gpp', 'gmp']

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeCowId(cowId) {
  return String(cowId || '')
    .replace(/^BOVIN\s*/i, '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase()
}

function isLactationRecord(record) {
  return Boolean(record && ('numlact' in record || 'kg_lait' in record || 'dtevel' in record))
}

function findNestedCowById(record, normalizedCowId) {
  for (const key of PARENT_KEYS) {
    const parent = record[key]
    const parentId = parent?.nni || parent?.num

    if (parentId && normalizeCowId(parentId) === normalizedCowId) {
      return { ...parent }
    }
  }

  return null
}

function findCowByIdentificationInRecords(cowId, records) {
  const normalizedCowId = normalizeCowId(cowId)

  if (!normalizedCowId) return null

  const exactMatch = records.find(
    record => record.nni && normalizeCowId(record.nni) === normalizedCowId
  )

  if (exactMatch) return { ...exactMatch }

  const nestedMatch = records
    .map(record => ({
      record,
      cow: findNestedCowById(record, normalizedCowId),
    }))
    .find(({ cow }) => cow)

  if (nestedMatch) {
    return {
      ...nestedMatch.cow,
      matchedIn: nestedMatch.record.nni || undefined,
    }
  }

  return null
}

export async function findCowByPartialId(partialId) {
  await delay(400)

  const cow = findCowByIdentificationInRecords(partialId, identificationsData)

  if (cow) return cow

  return findCowByIdentificationInRecords(partialId, lactationsData)
}

export async function getLactationsByNNI(nni) {
  await delay(300)

  const normalizedNni = normalizeCowId(nni)

  if (!normalizedNni) return []

  return lactationsData
    .filter(record => isLactationRecord(record) && normalizeCowId(record.nni) === normalizedNni)
    .sort((a, b) => (a.numlact || 1) - (b.numlact || 1))
}

export async function uploadImage(file) {
  await delay(500)
  return 'file://local-mock-path.jpg'
}

export async function sendPredictRequest(filePath) {
  await delay(400)
  return 'local-mock-event-id'
}

export async function pollResult(eventId, onStatusUpdate = () => {}) {
  onStatusUpdate('processing')

  await delay(600)
  onStatusUpdate('processing')

  await delay(600)
  onStatusUpdate('complete')

  return [
    null,
    'Identité trouvée',
    'MAR06BA000401670',
    'Confiance: 92.5%',
    []
  ]
}

export async function searchCowByNNI(nni) {
  await delay(300)

  const normalizedNni = normalizeCowId(nni)
  
  if (!normalizedNni) {
    throw new Error('Invalid NNI')
  }

  // Try exact match first
  let cowData = findCowByIdentificationInRecords(normalizedNni, identificationsData)
  if (cowData && cowData.nni) {
    const lactations = await getLactationsByNNI(cowData.nni)
    cowData.lactations = lactations
    return cowData
  }

  // If no exact match, try by last 4 digits
  const last4Match = normalizedNni.slice(-4)
  if (!last4Match) {
    throw new Error('Could not extract valid ID from input')
  }

  // Search in identifications
  const byLastDigits = identificationsData.find(record => 
    record.nni && normalizeCowId(record.nni).endsWith(last4Match)
  )

  if (byLastDigits) {
    cowData = { ...byLastDigits }
    const lactations = await getLactationsByNNI(cowData.nni)
    cowData.lactations = lactations
    return cowData
  }

  // Search in lactations as fallback
  const lactationRecord = lactationsData.find(record =>
    record.nni && normalizeCowId(record.nni).endsWith(last4Match)
  )

  if (lactationRecord) {
    cowData = findCowByIdentificationInRecords(lactationRecord.nni, identificationsData)
    if (cowData) {
      const lactations = await getLactationsByNNI(cowData.nni)
      cowData.lactations = lactations
      return cowData
    }
  }

  throw new Error(`No cattle found with NNI ending in ${last4Match}`)
}

export async function identifyCattle(file, onProgress = () => {}) {
  onProgress({ step: 'upload', status: 'uploading', message: 'uploading' })
  await uploadImage(file)
  onProgress({ step: 'upload', status: 'complete', message: 'complete' })

  onProgress({ step: 'predict', status: 'processing', message: 'sending' })
  const eventId = await sendPredictRequest('local-path')
  onProgress({ step: 'predict', status: 'complete', message: 'complete' })

  onProgress({ step: 'result', status: 'polling', message: 'analyzing' })
  const apiResult = await pollResult(eventId, (status) => {
    onProgress({ step: 'result', status: 'polling', message: status })
  })
  onProgress({ step: 'result', status: 'complete', message: 'complete' })

  const [debugImage, statusText, rawCowId, confidenceText, faissDetails] = apiResult
  const cowId = normalizeCowId(rawCowId)

  const confidenceMatch = confidenceText?.match(/([\d.]+)/)
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0

  const isFound = statusText?.toLowerCase().includes('trouvé') ||
                  statusText?.toLowerCase().includes('found') ||
                  confidence > 50

  let dbData = null
  if (cowId) {
    onProgress({ step: 'database', status: 'loading', message: 'loading' })
    try {
      dbData = await findCowByPartialId(cowId)

      if (dbData && dbData.nni) {
        const lactations = await getLactationsByNNI(dbData.nni)
        dbData.lactations = lactations
      }
      onProgress({ step: 'database', status: 'complete', message: 'complete' })
    } catch (err) {
      console.warn('Database fetch failed:', err)
      onProgress({ step: 'database', status: 'error', message: 'error' })
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
    dbData,
  }
}
