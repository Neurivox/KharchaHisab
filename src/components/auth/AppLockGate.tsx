import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  disableLock,
  hasPinSet,
  isLockEnabled,
  isSessionUnlocked,
  markSessionUnlocked,
  setPin,
  verifyPin,
} from "@/lib/appLock"

interface AppLockGateProps {
  children: React.ReactNode
}

export function AppLockGate({ children }: AppLockGateProps) {
  const [locked, setLocked] = useState(false)
  const [pin, setPinInput] = useState("")
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const enabled = isLockEnabled() && hasPinSet()
    const unlocked = isSessionUnlocked()
    setLocked(enabled && !unlocked)
    setChecking(false)
  }, [])

  const handleUnlock = async () => {
    setError("")
    const ok = await verifyPin(pin)
    if (ok) {
      markSessionUnlocked()
      setLocked(false)
      setPinInput("")
    } else {
      setError("Wrong PIN")
      setPinInput("")
    }
  }

  if (checking) return null

  if (!locked) return children

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="size-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">KharchaHisab</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your PIN to continue</p>
        </div>
        <Input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="••••"
          value={pin}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && void handleUnlock()}
          className="text-center text-lg tracking-[0.3em]"
          autoFocus
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" onClick={() => void handleUnlock()} disabled={pin.length < 4}>
          Unlock
        </Button>
      </div>
    </div>
  )
}

export { setPin, disableLock, hasPinSet, isLockEnabled }
