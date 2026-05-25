import type { InferenceLog } from './types'

export function sendLog(log: InferenceLog): void {
  fetch('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  }).catch(() => {})
}