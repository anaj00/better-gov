import { seedRequests } from './data'
import type { RequestRecord } from './types'

const REQUESTS_KEY = 'easeph-requests-v1'
const AUTH_KEY = 'easeph-agency-auth'

export function getRequests(): RequestRecord[] {
  const stored = localStorage.getItem(REQUESTS_KEY)
  if (stored) {
    try { return JSON.parse(stored) as RequestRecord[] } catch { /* reseed invalid demo data */ }
  }
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(seedRequests))
  return seedRequests
}

export function saveRequests(requests: RequestRecord[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  window.dispatchEvent(new Event('easeph-requests-changed'))
}

export function addRequest(request: RequestRecord) {
  saveRequests([request, ...getRequests()])
}

export function updateRequest(serial: string, updates: Partial<RequestRecord>) {
  saveRequests(getRequests().map((request) => request.serialCode === serial ? { ...request, ...updates, lastUpdated: new Date().toISOString() } : request))
}

export function resetRequests() {
  saveRequests(seedRequests)
}

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === 'true'
export const setAuthenticated = (value: boolean) => localStorage.setItem(AUTH_KEY, String(value))

export function generateSerial() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `EASE-${new Date().getFullYear()}-${suffix}`
}

export const formatDate = (date: string, style: 'short' | 'long' = 'long') => new Intl.DateTimeFormat('en-PH', style === 'short' ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))
