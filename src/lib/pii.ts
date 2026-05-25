const PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/gi,
  /\b\d{10,13}\b/g,
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
]

export function redactPII(text: string): string {
  return PATTERNS.reduce((t, p) => t.replace(p, '[REDACTED]'), text)
}