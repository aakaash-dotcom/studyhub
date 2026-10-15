import catalogue from './catalogue.json'

// Hard contract - field names are fixed
export interface CatalogueRecord {
  id: string
  class: string
  subject: string
  subject_ta: string
  medium: string
  exam: string
  year: number
  paper_number: number | null
  resource_type: string
  resource_type_ta: string
  title_en: string
  title_ta: string
  description_en: string
  pages: number
  size: string
  marks_pattern: string
  total_marks: number
  question_count: number
  duration: string
  price_tier: string
  price_inr: number
  preview_pages: number
  file_pdf: string
  file_preview_base?: string
  drive_file_id?: string
  apps_script_url?: string
  tags: string[]
  status: string
}

interface LoadResult {
  records: CatalogueRecord[]
  quarantined: { record: unknown; reason: string }[]
  totalCount: number
  validCount: number
  quarantinedCount: number
}

const REQUIRED_FIELDS = [
  'id', 'class', 'subject', 'subject_ta', 'medium', 'exam', 'year',
  'resource_type', 'resource_type_ta', 'title_en', 'title_ta', 'description_en',
  'pages', 'size', 'marks_pattern', 'total_marks', 'question_count', 'duration',
  'price_tier', 'price_inr', 'preview_pages', 'file_pdf', 'tags', 'status'
]

const VALID_STATUSES = ['published', 'draft', 'archived']
const VALID_PRICE_TIERS = ['free', 'premium', 'paid']

function validateRecord(raw: unknown): { valid: true; record: CatalogueRecord } | { valid: false; reason: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, reason: 'Not an object' }
  }

  const record = raw as Record<string, unknown>

  // Check all required fields exist
  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) {
      return { valid: false, reason: `Missing required field: ${field}` }
    }
  }

  // Type checks
  if (typeof record.id !== 'string' || record.id.length === 0) {
    return { valid: false, reason: 'id must be a non-empty string' }
  }
  if (typeof record.class !== 'string') {
    return { valid: false, reason: 'class must be a string' }
  }
  if (typeof record.year !== 'number') {
    return { valid: false, reason: 'year must be a number' }
  }
  if (typeof record.pages !== 'number' || record.pages < 1) {
    return { valid: false, reason: 'pages must be a positive number' }
  }
  if (typeof record.total_marks !== 'number') {
    return { valid: false, reason: 'total_marks must be a number' }
  }
  if (typeof record.preview_pages !== 'number' || record.preview_pages < 1) {
    return { valid: false, reason: 'preview_pages must be a positive number' }
  }
  if (!Array.isArray(record.tags)) {
    return { valid: false, reason: 'tags must be an array' }
  }
  if (!VALID_STATUSES.includes(record.status as string)) {
    return { valid: false, reason: `Invalid status: ${record.status}. Must be one of: ${VALID_STATUSES.join(', ')}` }
  }
  if (!VALID_PRICE_TIERS.includes(record.price_tier as string)) {
    return { valid: false, reason: `Invalid price_tier: ${record.price_tier}` }
  }

  return {
    valid: true,
    record: record as unknown as CatalogueRecord
  }
}

// Load and validate catalogue - never half-imports
export function loadCatalogue(): LoadResult {
  const records: CatalogueRecord[] = []
  const quarantined: { record: unknown; reason: string }[] = []

  for (const raw of catalogue) {
    const result = validateRecord(raw)
    if (result.valid) {
      records.push(result.record)
    } else {
      quarantined.push({ record: raw, reason: result.reason })
    }
  }

  return {
    records,
    quarantined,
    totalCount: catalogue.length,
    validCount: records.length,
    quarantinedCount: quarantined.length
  }
}

// Singleton loaded catalogue
let _loaded: LoadResult | null = null

export function getCatalogue(): LoadResult {
  if (!_loaded) {
    _loaded = loadCatalogue()
  }
  return _loaded
}

// Helper getters
export function getPublishedRecords(): CatalogueRecord[] {
  return getCatalogue().records.filter(r => r.status === 'published')
}

export function getRecordById(id: string): CatalogueRecord | undefined {
  return getCatalogue().records.find(r => r.id === id)
}

export function getRecordsByClass(classNum: string): CatalogueRecord[] {
  return getPublishedRecords().filter(r => r.class === classNum)
}

export function getRecordsByClassAndType(classNum: string, resourceType: string): CatalogueRecord[] {
  return getPublishedRecords().filter(r => r.class === classNum && r.resource_type === resourceType)
}

export function getRecordsByClassTypeSubject(classNum: string, resourceType: string, subject: string): CatalogueRecord[] {
  return getPublishedRecords().filter(r =>
    r.class === classNum &&
    r.resource_type === resourceType &&
    r.subject.toLowerCase() === subject.toLowerCase()
  )
}

export function getRecordsByClassAndSubject(classNum: string, subject: string): CatalogueRecord[] {
  const s = subject.replace(/-/g, ' ').toLowerCase()
  return getPublishedRecords().filter(r =>
    r.class === classNum && r.subject.toLowerCase() === s
  )
}

// Helper to check if a resource is premium (Pro) content
export function isProItem(record: CatalogueRecord): boolean {
  return record.price_tier === 'premium'
}

// Helper to check if a resource is free (for the free shelf)
// Free = QuestionPaper OR ModelQuestionPaper OR AnswerKey
export function isFreeItem(record: CatalogueRecord): boolean {
  return (
    record.resource_type === 'QuestionPaper' ||
    record.resource_type === 'ModelQuestionPaper' ||
    record.resource_type === 'AnswerKey'
  )
}

// Parse marks_pattern into structured data
export function parseMarksPattern(pattern: string): { part: string; questions: string; marks_each: string; note?: string }[] {
  const parts: { part: string; questions: string; marks_each: string; note?: string }[] = []
  const segments = pattern.split('|').map(s => s.trim())

  for (const segment of segments) {
    if (segment.includes('hrs') || segment.includes('marks')) {
      // This is the summary segment, skip
      continue
    }
    const match = segment.match(/(Part\s+[IVX]+)\s+(\d+)x(\d+)(.*)/i)
    if (match) {
      parts.push({
        part: match[1],
        questions: match[2],
        marks_each: match[3],
        note: match[4]?.trim() || undefined
      })
    }
  }

  return parts
}

// Resource type mapping
export const RESOURCE_TYPES = [
  { id: 'ImportantQuestions', name: 'Important Questions', name_ta: 'முக்கிய கேள்விகள்', icon: '⭐' },
  { id: 'ModelQuestionPaper', name: 'Model Papers', name_ta: 'மாதிரி வினாத்தாள்', icon: '📋' },
  { id: 'QuestionPaper', name: 'Question Papers', name_ta: 'வினாத்தாள்', icon: '📝' },
  { id: 'AnswerKey', name: 'Answer Keys', name_ta: 'விடைக்குறிப்பு', icon: '✅' },
  { id: 'StudyMaterial', name: 'Study Material', name_ta: 'படிப்பு பொருள்', icon: '📘' },
  { id: 'Notes', name: 'Notes', name_ta: 'குறிப்புகள்', icon: '📄' },
]

// Subject list for TN State Board
export const SUBJECTS: Record<string, { name: string; name_ta: string; icon: string }[]> = {
  '8': [
    { name: 'Maths', name_ta: 'கணிதம்', icon: '🔢' },
    { name: 'Science', name_ta: 'அறிவியல்', icon: '🔬' },
    { name: 'English', name_ta: 'ஆங்கிலம்', icon: '📖' },
    { name: 'Tamil', name_ta: 'தமிழ்', icon: '📝' },
    { name: 'Social Science', name_ta: 'சமூக அறிவியல்', icon: '🌍' },
  ],
  '9': [
    { name: 'Maths', name_ta: 'கணிதம்', icon: '🔢' },
    { name: 'Science', name_ta: 'அறிவியல்', icon: '🔬' },
    { name: 'English', name_ta: 'ஆங்கிலம்', icon: '📖' },
    { name: 'Tamil', name_ta: 'தமிழ்', icon: '📝' },
    { name: 'Social Science', name_ta: 'சமூக அறிவியல்', icon: '🌍' },
  ],
  '10': [
    { name: 'Maths', name_ta: 'கணிதம்', icon: '🔢' },
    { name: 'Science', name_ta: 'அறிவியல்', icon: '🔬' },
    { name: 'English', name_ta: 'ஆங்கிலம்', icon: '📖' },
    { name: 'Tamil', name_ta: 'தமிழ்', icon: '📝' },
    { name: 'Social Science', name_ta: 'சமூக அறிவியல்', icon: '🌍' },
  ],
  '11': [
    { name: 'Maths', name_ta: 'கணிதம்', icon: '🔢' },
    { name: 'Physics', name_ta: 'இயற்பியல்', icon: '⚡' },
    { name: 'Chemistry', name_ta: 'வேதியியல்', icon: '🧪' },
    { name: 'Biology', name_ta: 'உயிரியல்', icon: '🧬' },
    { name: 'Computer Science', name_ta: 'கணினி அறிவியல்', icon: '💻' },
    { name: 'Commerce', name_ta: 'வணிகவியல்', icon: '💼' },
    { name: 'Accountancy', name_ta: 'கணக்குப் பதிவியல்', icon: '📊' },
    { name: 'Economics', name_ta: 'பொருளாதாரம்', icon: '📈' },
    { name: 'English', name_ta: 'ஆங்கிலம்', icon: '📖' },
    { name: 'Tamil', name_ta: 'தமிழ்', icon: '📝' },
  ],
  '12': [
    { name: 'Maths', name_ta: 'கணிதம்', icon: '🔢' },
    { name: 'Physics', name_ta: 'இயற்பியல்', icon: '⚡' },
    { name: 'Chemistry', name_ta: 'வேதியியல்', icon: '🧪' },
    { name: 'Biology', name_ta: 'உயிரியல்', icon: '🧬' },
    { name: 'Computer Science', name_ta: 'கணினி அறிவியல்', icon: '💻' },
    { name: 'Commerce', name_ta: 'வணிகவியல்', icon: '💼' },
    { name: 'Accountancy', name_ta: 'கணக்குப் பதிவியல்', icon: '📊' },
    { name: 'Economics', name_ta: 'பொருளாதாரம்', icon: '📈' },
    { name: 'English', name_ta: 'ஆங்கிலம்', icon: '📖' },
    { name: 'Tamil', name_ta: 'தமிழ்', icon: '📝' },
  ],
}

// Classes - ordered 12 to 8 (reverse)
export const CLASSES = [
  { id: '12', name: '12th Standard', name_ta: '12ம் வகுப்பு', icon: '🎖️', drive_folder_id: '' },
  { id: '11', name: '11th Standard', name_ta: '11ம் வகுப்பு', icon: '📖', drive_folder_id: '' },
  { id: '10', name: '10th Standard', name_ta: '10ம் வகுப்பு', icon: '🏆', drive_folder_id: '' },
  { id: '9', name: '9th Standard', name_ta: '9ம் வகுப்பு', icon: '📗', drive_folder_id: '' },
  { id: '8', name: '8th Standard', name_ta: '8ம் வகுப்பு', icon: '📘', drive_folder_id: '' },
]
