const PIN_HASH_KEY = "expense_tracker_pin_hash"
const LOCK_ENABLED_KEY = "expense_tracker_lock_enabled"
const SESSION_UNLOCKED_KEY = "expense_tracker_session_unlocked"

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`kharcha:${pin}`)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function isLockEnabled(): boolean {
  return localStorage.getItem(LOCK_ENABLED_KEY) === "true"
}

export function hasPinSet(): boolean {
  return !!localStorage.getItem(PIN_HASH_KEY)
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === "true"
}

export function markSessionUnlocked(): void {
  sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true")
}

export function clearSessionUnlock(): void {
  sessionStorage.removeItem(SESSION_UNLOCKED_KEY)
}

export async function setPin(pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error("PIN must be 4–6 digits")
  }
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_HASH_KEY, hash)
  localStorage.setItem(LOCK_ENABLED_KEY, "true")
  markSessionUnlocked()
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY)
  if (!stored) return false
  const hash = await hashPin(pin)
  return hash === stored
}

export function disableLock(): void {
  localStorage.removeItem(PIN_HASH_KEY)
  localStorage.removeItem(LOCK_ENABLED_KEY)
  clearSessionUnlock()
}

export function enableLock(): void {
  if (!hasPinSet()) {
    throw new Error("Set a PIN first")
  }
  localStorage.setItem(LOCK_ENABLED_KEY, "true")
}
