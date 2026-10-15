// Events system for funnel tracking
// Money-adjacent events should be written server-side (marked below)

export type EventType =
  | 'page_view'
  | 'preview_page_n'
  | 'login_wall_hit'
  | 'login_success'
  | 'download'
  | 'search'
  | 'purchase'

export interface AnalyticsEvent {
  type: EventType
  timestamp: number
  sessionId: string
  userId?: string
  data: Record<string, unknown>
}

// Money-adjacent events that should be server-side
const SERVER_SIDE_EVENTS: EventType[] = ['download', 'purchase']

let sessionId: string | null = null

function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('rt_session_id')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem('rt_session_id', sessionId)
    }
  }
  return sessionId
}

// Event buffer - batched writes for performance
const eventBuffer: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function flushEvents() {
  if (eventBuffer.length === 0) return

  // In production, this would POST to your events API
  // For now, store in localStorage for admin funnel view
  const stored = JSON.parse(localStorage.getItem('rt_events') || '[]')
  stored.push(...eventBuffer)
  
  // Keep last 1000 events
  if (stored.length > 1000) {
    stored.splice(0, stored.length - 1000)
  }
  
  localStorage.setItem('rt_events', JSON.stringify(stored))
  eventBuffer.length = 0
}

export function trackEvent(type: EventType, data: Record<string, unknown> = {}) {
  const event: AnalyticsEvent = {
    type,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId: localStorage.getItem('rt_user_id') || undefined,
    data
  }

  eventBuffer.push(event)

  // Money-adjacent events: flush immediately (would be server-side in production)
  if (SERVER_SIDE_EVENTS.includes(type)) {
    flushEvents()
    return
  }

  // Other events: batched flush every 5 seconds
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushEvents()
      flushTimer = null
    }, 5000)
  }
}

// Convenience trackers
export function trackPageView(path: string, title: string) {
  trackEvent('page_view', { path, title })
}

export function trackPreviewPage(resourceId: string, pageNumber: number) {
  trackEvent('preview_page_n', { resourceId, pageNumber })
}

export function trackLoginWallHit(resourceId: string) {
  trackEvent('login_wall_hit', { resourceId })
}

export function trackLoginSuccess(method: string) {
  trackEvent('login_success', { method })
}

export function trackDownload(resourceId: string) {
  trackEvent('download', { resourceId })
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent('search', { query, resultCount })
}

// Get events for admin funnel
export function getEvents(): AnalyticsEvent[] {
  return JSON.parse(localStorage.getItem('rt_events') || '[]')
}

export function getFunnelData() {
  const events = getEvents()
  
  const pageViews = events.filter(e => e.type === 'page_view').length
  const previewViews = events.filter(e => e.type === 'preview_page_n').length
  const wallHits = events.filter(e => e.type === 'login_wall_hit').length
  const logins = events.filter(e => e.type === 'login_success').length
  const downloads = events.filter(e => e.type === 'download').length

  return {
    pageViews,
    previewViews,
    wallHits,
    logins,
    downloads,
    conversionRates: {
      viewToPreview: pageViews > 0 ? ((previewViews / pageViews) * 100).toFixed(1) : '0',
      previewToWall: previewViews > 0 ? ((wallHits / previewViews) * 100).toFixed(1) : '0',
      wallToLogin: wallHits > 0 ? ((logins / wallHits) * 100).toFixed(1) : '0',
      loginToDownload: logins > 0 ? ((downloads / logins) * 100).toFixed(1) : '0',
    }
  }
}
